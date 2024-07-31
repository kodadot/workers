<template>
    <div>
        <p>address: {{ address }}</p>
        <p>token: {{ token }}</p>
        {{ item }}
        <div>
            <p>image:</p>
            <img :src="image" :alt="item.metadata.name" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { createThirdwebClient, getContract } from 'thirdweb'
import { base } from 'thirdweb/chains';
import { getNFT } from 'thirdweb/extensions/erc721'

const router = useRouter()
const id = router.currentRoute.value.params.id.toString().split('-')
const address = id[0]
const token = id[1] as unknown as bigint

const client = createThirdwebClient({
    clientId: 'd0455344acaa6fb760281466980f3ec6'
})
const contract = getContract({
    client,
    chain: base,
    address: address,
})
const item = await getNFT({
    contract,
    tokenId: token
})

const imageUri = item.metadata.image || 'https://kodadot.xyz/k_card.png'
const image = await parseImage(ipfsUrl(imageUri), false)

defineOgImage({
    component: 'gallery',
    props: {
        title: item.metadata.name,
        image,
        network: 'base'
    }
})

useSeoMeta({
    title: seoTitle(item.metadata.name),
    description: item.metadata.description,
    ogTitle: seoTitle(item.metadata.name),
    ogDescription: item.metadata.description,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: seoTitle(item.metadata.name),
    twitterImageAlt: item.metadata.name,
})
</script>
