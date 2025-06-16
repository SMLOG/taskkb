import { view, requestJira } from '@forge/bridge';
import { jsonParse } from '@/lib/parse';

// Helper function to resolve issue ID from context
async function resolveIssueId(context) {
    let issueId = context?.extension?.issue?.id;
    const issueKey = context?.extension?.issue?.key;

    if (!issueId && !issueKey) {
        throw new Error('Missing issue ID and key in context');
    }

    if (!issueId && issueKey) {
        const issueUrl = `/rest/api/2/issue/${issueKey}?fields=id`;
        const issueResponse = await requestJira(issueUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (issueResponse.status !== 200) {
            throw new Error(`Failed to fetch issue ID for key ${issueKey}: ${issueResponse.status}`);
        }

        const issueData = await issueResponse.json();
        issueId = issueData.id;
        if (!issueId) {
            throw new Error(`No issue ID found for key ${issueKey}`);
        }
    }

    return issueId;
}

export async function readJsonAttachment(filename) {
    if (!filename || typeof filename !== 'string') {
        return { error: 'Invalid or missing filename' };
    }

    try {
        const context = await view.getContext();
        const issueId = await resolveIssueId(context);

        // Fetch attachments
        const attachmentsUrl = `/rest/api/2/issue/${issueId}?fields=attachment`;
        const attachmentsResponse = await requestJira(attachmentsUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (attachmentsResponse.status !== 200) {
            return { error: `Failed to fetch attachments: ${attachmentsResponse.status}` };
        }

        const attachmentData = (await attachmentsResponse.json());
        const attachments = attachmentData.fields?.attachment || [];
        const jsonAttachment = attachments.find(attachment => attachment.filename === filename);

        if (!jsonAttachment) {
            return { error: `No attachment found with filename ${filename}` };
        }

        // Extract attachment ID from content URL
        const attachmentUrl = jsonAttachment.content;
        const attachmentIdMatch = attachmentUrl.match(/\/content\/(\d+)/);
        const attachmentId = attachmentIdMatch?.[1];

        if (!attachmentId) {
            return { error: 'Invalid attachment content URL' };
        }

        // Fetch attachment content
        const fileUrl = `/rest/api/2/attachment/content/${attachmentId}`;
        const fileResponse = await requestJira(fileUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (fileResponse.status !== 200) {
            const errorText = await fileResponse.text();
            console.error(`Failed to fetch attachment content: ${errorText}`);
            return { error: `Failed to fetch attachment content: ${fileResponse.status}` };
        }

        const content = await jsonParse(await fileResponse.text());
        return { attachmentId, content };
    } catch (error) {
        console.error(`Error reading JSON attachment: ${error.message}`);
        return { error: error.message };
    }
}

export async function writeObjectToJsonAttachment(dataObject, filename, attachmentId) {
    if (!dataObject || typeof dataObject !== 'object') {
        return { success: false, error: 'Invalid or missing data object' };
    }
    if (!filename || typeof filename !== 'string') {
        return { success: false, error: 'Invalid or missing filename' };
    }

    try {
        const context = await view.getContext();
        const issueId = await resolveIssueId(context);

        // Convert object to JSON string and create blob
        const jsonString = JSON.stringify(dataObject, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const formData = new FormData();
        formData.append('file', blob, filename);

        // Create new attachment
        const attachmentsUrl = `/rest/api/3/issue/${issueId}/attachments`;
        const response = await requestJira(attachmentsUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Atlassian-Token': 'no-check'
            },
            body: formData
        });

        if (response.status !== 200) {
            const errorText = await response.text();
            console.error(`Failed to upload attachment: ${errorText}`);
            return { success: false, error: `Failed to upload attachment: ${response.status}` };
        }

        // Delete old attachment if provided
        console.info("delete attachment id ",attachmentId)
        if (attachmentId && !isNaN(parseInt(attachmentId))) {
            const deleteResponse = await requestJira(`/rest/api/3/attachment/${attachmentId}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });

            if (deleteResponse.status !== 204) {
                console.warn(`Failed to delete old attachment ${attachmentId}: ${deleteResponse.status}`);
            }
        }

        const result = await response.json();
        return { success: true, attachmentId:result[0].id};
    } catch (error) {
        console.error(`Error writing JSON attachment: ${error.message}`);
        return { success: false, error: error.message };
    }
}