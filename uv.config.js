self.__uv$config = {
    prefix: '/service/',
    
    // Your God-Tier Cloudflare Bare Server
    bare: 'https://roogle-v4-bare.uraverageopdoge.workers.dev/',
    
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    
    // UV v3.2.7 Dependencies
    handler: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@3.2.7/dist/uv.handler.js',
    bundle: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@3.2.7/dist/uv.bundle.js',
    client: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@3.2.7/dist/uv.client.js', // 👇 THE MISSING FIX
    config: '/uv.config.js',
    sw: '/sw.js',
};