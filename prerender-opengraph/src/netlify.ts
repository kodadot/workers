/**
 * Function to request the prerendered version of a request.
 */
export default function netlifyRequest(
  request: Request,
  path: string
): Promise<Response> {
  const { headers } = request;
  const prerenderUrl = `https://beta.kodadot.xyz/${path}`;
  const headersToSend = new Headers(headers);

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
  });

  return fetch(prerenderRequest);
}
