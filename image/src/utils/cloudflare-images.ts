import { trimEndpoint } from '../routes/type-url';

export async function ipfsToCloudflareImages({
  token,
  gateway,
  path,
  imageAccount,
  imageId,
}: {
  token: string;
  gateway: string;
  path: string;
  imageAccount: string;
  imageId: string;
}) {
  const imageOnIpfs = `${gateway}/ipfs/${path}`;

  // resize image using wsrv.nl
  const resizeImage = new URL('https://wsrv.nl');
  resizeImage.searchParams.append('url', imageOnIpfs);
  resizeImage.searchParams.append('w', '1400');

  console.log(resizeImage.toString());

  await fetch(resizeImage.toString(), { method: 'HEAD' });

  // upload image to cf-images
  const uploadHeaders = new Headers();
  uploadHeaders.append('Authorization', `Bearer ${token}`);

  const uploadFormData = new FormData();
  uploadFormData.append('url', resizeImage.toString());
  uploadFormData.append('id', path);

  const requestOptions = {
    method: 'POST',
    headers: uploadHeaders,
    body: uploadFormData,
    redirect: 'follow',
  };

  const uploadCfImage = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${imageAccount}/images/v1`,
    requestOptions,
  );
  const uploadStatus = uploadCfImage.status;

  console.log('uploadStatus', uploadStatus);

  // if image supported by cf-images, redirect to cf-images
  if (uploadStatus === 200) {
    // return Response.redirect(`https://imagedelivery.net/${c.env.CF_IMAGE_ID}/${path}/public`, 302)
    return `https://imagedelivery.net/${imageId}/${path}/public`;
  }

  return '';
}

type URLToCFImagesParams = {
  token: string;
  endpoint: string;
  imageAccount: string;
  imageId: string;
};

export async function urlToCloudflareImages({
  token,
  endpoint,
  imageAccount,
  imageId,
}: URLToCFImagesParams) {
  const path = trimEndpoint(endpoint);

  // resize image using wsrv.nl
  const resizeImage = new URL('https://wsrv.nl');
  resizeImage.searchParams.append('url', endpoint);
  resizeImage.searchParams.append('w', '1400');

  console.log(resizeImage.toString());

  await fetch(resizeImage.toString(), { method: 'HEAD' });

  // upload image to cf-images
  const uploadHeaders = new Headers();
  uploadHeaders.append('Authorization', `Bearer ${token}`);

  const uploadFormData = new FormData();
  uploadFormData.append('url', resizeImage.toString());
  uploadFormData.append('id', path);

  const requestOptions = {
    method: 'POST',
    headers: uploadHeaders,
    body: uploadFormData,
    redirect: 'follow',
  };

  const uploadCfImage = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${imageAccount}/images/v1`,
    requestOptions,
  );
  const uploadStatus = uploadCfImage.status;

  console.log('uploadStatus', uploadStatus);

  // if image supported by cf-images, redirect to cf-images
  if (uploadStatus === 200) {
    return `https://imagedelivery.net/${imageId}/${path}/public`;
  }

  return '';
}
