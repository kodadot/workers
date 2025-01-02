## Background

Currently, our DAPP is rendered using Client-Side Rendering (CSR). The downside of CSR is that it is quite difficult to optimise for SEO stuff, including OpenGraph, compared to Server-Side Rendering (SSR).

This service can help to achieve that. So, our DAPP looks better regarding SEO (Google search results) or when we share our link on social media.

Services:

- [ogi-route](https://github.com/kodadot/workers/tree/main/services/ogi-route). Act as a load balancer to proxy user agent to render ogi or nft-gallery. Ref: https://developers.cloudflare.com/workers/configuration/routing/routes/.
- [ogi](https://github.com/kodadot/workers/tree/main/ogi). It acts as a mini SSR page to render meta tags.
- [nft-gallery](https://github.com/kodadot/nft-gallery). Our DAPP

Third-party similar services:

- https://prerender.io/
- https://ostr.io/

Better alternative implementation:

- Append meta tags to the HTML response from the server.
- Even Better: Use SSR. Ref: https://github.com/kodadot/nft-gallery/pull/9155 (but, so many breaking changes)

## Architecture diagram

```mermaid
graph LR
    A[User] --> B[koda.art]
    B --> C{ogi-route}
    C -->|SEO sensitive paths| D[ogi]
    C -->|All other routes| E[nft-gallery]
    E -->|For generative art| F[dyndata]
    E -->|For generative art| G[fxart]
    E -->|NFT & contract info| M[oda]
    
    F -->|Generate| H[Dynamic ID for substrate]
    F -->|Generate| I[Dynamic metadata]
    F -->|/image| O{Cache exists?}
    O -->|Yes| P[Return from R2 bucket]
    O -->|No| Q[Capture service]
    Q --> R[Store in R2 bucket]
    R --> P
    
    G -->|Generate| J[Dynamic ID for substrate]
    G -->|Generate| K[Dynamic metadata]
    G -->|Schedule| L[Calendar endpoints]
    
    M -->|Unified endpoint| N[Substrate & EVM NFT<br/>and contract details]
    
    style C fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
    style F fill:#fbb,stroke:#333,stroke-width:2px
    style G fill:#fbb,stroke:#333,stroke-width:2px
    style M fill:#bff,stroke:#333,stroke-width:2px
    style O fill:#fcf,stroke:#333,stroke-width:2px
    style Q fill:#cff,stroke:#333,stroke-width:2px
    
    classDef note fill:#fff,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef endpoint fill:#ffe,stroke:#333,stroke-width:1px;
    classDef storage fill:#ffd,stroke:#333,stroke-width:2px;
    
    N1[SEO sensitive paths<br/>e.g., /gallery, /collection]:::note
    N2[Main gallery for<br/>user interactions]:::note
    N3[Generative art<br/>components]:::note
    N4[Unified NFT &<br/>contract info service]:::note
    
    H:::endpoint
    I:::endpoint
    J:::endpoint
    K:::endpoint
    L:::endpoint
    N:::endpoint
    P:::storage
    R:::storage
    
    N1 -.-> C
    N2 -.-> E
    N3 -.-> F
    N3 -.-> G
    N4 -.-> M

```