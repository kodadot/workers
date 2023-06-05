/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

export interface Env {
  replicate: Fetcher,
	WEBHOOK: string,
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(doSomeTaskOnASchedule(env))
  },
}

async function doSomeTaskOnASchedule(env: Env): Promise<any> {
  const body = {
    version: '42a996d39a96aedc57b2e0aa8105dea39c9c89d9d266caf6bb4327a1c191b061',
    input: {
      prompt:
        'medium digital painting of smiling anime waifu with light brown hair, wearing casual summer dress, soft lighting, Prague in the background',
      negative_prompt:
        'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name',
      width: 512,
      height: 512,
      num_outputs: 1,
      guidance_scale: 7,
      num_inference_steps: 50,
    },
    webhook: env.WEBHOOK,
    webhook_events_filter: ['completed'],
  }

  try {
    const req = new Request('https://replicate.kodadot.art/predict', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const replicateResponse = await fetch(req)
    console.log(replicateResponse.status, replicateResponse.statusText)
  } catch (e) {
    console.log(e)
  }
}
