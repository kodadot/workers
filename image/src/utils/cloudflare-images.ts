export async function uploadToCloudflareImages({
  token,
  gateway,
  cid,
  imageAccount,
  imageId,
}: {
  token: string;
  gateway: string;
  cid: string;
  imageAccount: string;
  imageId: string;
}) {
  const uploadHeaders = new Headers();
  uploadHeaders.append('Authorization', `Bearer ${token}`);

  const uploadFormData = new FormData();
  uploadFormData.append('url', `${gateway}/ipfs/${cid}`);
  uploadFormData.append('id', cid);

  const requestOptions = {
    method: 'POST',
    headers: uploadHeaders,
    body: uploadFormData,
    redirect: 'follow',
  };

  const uploadCfImage = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${imageAccount}/images/v1`,
    requestOptions
  );
  const uploadStatus = uploadCfImage.status;

  // if image supported by cf-images or already exists, redirect to cf-images
  if (uploadStatus === 200 || uploadStatus === 409) {
    // return Response.redirect(`https://imagedelivery.net/${c.env.CF_IMAGE_ID}/${cid}/public`, 302)
    return `https://imagedelivery.net/${imageId}/${cid}/public`;
  }

  return '';
}
