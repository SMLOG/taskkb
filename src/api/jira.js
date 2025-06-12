import { view, requestJira } from '@forge/bridge';

// Read JSON attachment from issue using v2 API with issue ID and siteUrl
export async function readJsonAttachment(filename) {
    try {

        const context = await view.getContext();

        let issueId = context?.extension?.issue?.id;
        const issueKey = context?.extension?.issue?.key;


        if (!issueId && !issueKey) {

            return null;
        }

        // If issue ID is not in context, fetch it using issue key
        if (!issueId && issueKey) {

            const issueUrl = `/rest/api/2/issue/${issueKey}?fields=id`;
            const issueResponse = await requestJira(issueUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (issueResponse.status !== 200) {

                return null;
            }

            const issueData = await issueResponse.json();
            issueId = issueData.id;
            if (!issueId) {

                return null;
            }

        }

        const attachmentsUrl = `/rest/api/2/issue/${issueId}?fields=attachment`;

        const attachmentsResponse = await requestJira(attachmentsUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (attachmentsResponse.status !== 200) {

            return null;
        }

        const attachmentData = await attachmentsResponse.json();
        const attachments = attachmentData.fields.attachment || [];

        const jsonAttachment = attachments.find(attachment => attachment.filename === filename);
        if (!jsonAttachment) {

            return null;
        }


        const attachmentUrl = jsonAttachment.content;
        const attachmentIdMatch = attachmentUrl.match(/\/content\/(\d+)/);
        if (!attachmentIdMatch || !attachmentIdMatch[1]) {

            return null;
        }
        const attachmentId = attachmentIdMatch[1];


        const fileUrl = `/rest/api/2/attachment/content/${attachmentId}`;

        const fileResponse = await requestJira(fileUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (fileResponse.status !== 200) {
            const errorText = await fileResponse.text();

            console.error(
                errorText
            );
            return null;
        }

        return await fileResponse.json();
    } catch (error) {

        return null;
    }
}

export async function writeObjectToJsonAttachment(dataObject, filename) {
    try {


        const context = await view.getContext();

        let issueId = context?.extension?.issue?.id;
        const issueKey = context?.extension?.issue?.key;


        if (!issueId && !issueKey) {

            return false;
        }

        // If issue ID is not in context, fetch it using issue key
        if (!issueId && issueKey) {

            const issueUrl = `/rest/api/2/issue/${issueKey}?fields=id`;
            const issueResponse = await requestJira(issueUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (issueResponse.status !== 200) {

                return false;
            }

            const issueData = await issueResponse.json();
            issueId = issueData.id;
            if (!issueId) {

                return false;
            }

        }

        // Convert object to JSON string
        const jsonString = JSON.stringify(dataObject, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const formData = new FormData();
        formData.append('file', blob, filename);

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

            return false;
        }
        return true;
    } catch (error) {

        return false;
    }
}