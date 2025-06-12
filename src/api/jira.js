import { view, requestJira } from '@forge/bridge';
import { invoke } from '@forge/bridge';
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

            return {};
        }

        const attachmentData = await attachmentsResponse.json();
        const attachments = attachmentData.fields.attachment || [];

        const jsonAttachment = attachments.find(attachment => attachment.filename === filename);
        if (!jsonAttachment) {

            return {};
        }


        const attachmentUrl = jsonAttachment.content;
        const attachmentIdMatch = attachmentUrl.match(/\/content\/(\d+)/);
        if (!attachmentIdMatch || !attachmentIdMatch[1]) {

            return {};
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
            return {};
        }

        return await {attachmentId,content:await fileResponse.json()};
    } catch (error) {

        return {};
    }
}

async function updateAttachment(issueId, attachmentId, dataObject, filename) {
    try {
      // Validate inputs
      if (!dataObject || typeof dataObject !== 'object') {
        throw new Error('Invalid dataObject: Must be a valid object');
      }
      if (!filename || typeof filename !== 'string' || filename.trim() === '') {
        throw new Error('Invalid filename: Must be a non-empty string');
      }
  
      // Create JSON string and Blob
      let jsonString;
      try {
        jsonString = JSON.stringify(dataObject, null, 2);
      } catch (error) {
        throw new Error(`Failed to stringify dataObject: ${error.message}`);
      }
  
      const blob = new Blob([jsonString], { type: 'application/json' });
  
      // Check file size (10MB limit for Jira)
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds Jira attachment limit (10MB)');
      }
  
      // Convert Blob to base64 for JSON-serializable payload
      const reader = new FileReader();
      const fileContent = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 content
        reader.readAsDataURL(blob);
      });
  
      // Invoke backend resolver
      const response = await invoke('updateAttachment', {
        issueId,
        attachmentId,
        fileName: filename,
        fileContent
      });
  
      if (response.success) {
        console.log('Attachment updated successfully:', response.data);
        return response.data;
      }
  
      throw new Error(response.error);
    } catch (error) {
      console.error('Error updating attachment:', error);
      throw error;
    }
  }

export async function writeObjectToJsonAttachment(dataObject, filename, attachmentId) {
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

        let response;
        if (attachmentId > 0) {

        //response = await updateAttachment(issueId, attachmentId, dataObject, filename);

         response = await requestJira(`/rest/api/3/attachment/${attachmentId}`, {
            method: 'DELETE'
          });
          
          console.log(`Response: ${response.status} ${response.statusText}`);
          console.log(await response.text());
        
        } 
            // Create new attachment
            const attachmentsUrl = `/rest/api/3/issue/${issueId}/attachments`;
            response = await requestJira(attachmentsUrl, {
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

        let result = await response.json();
        return Array.isArray(result) ? result[0] : result;
    } catch (error) {
        return false;
    }
}