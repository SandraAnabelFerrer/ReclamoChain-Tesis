/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Exclude mongodb and related modules from client bundle
            config.resolve.fallback = {
                ...config.resolve.fallback,
                net: false,
                tls: false,
                fs: false,
                dns: false,
                child_process: false,
                "mongodb-client-encryption": false,
                "timers/promises": false,
            };
        }
        return config;
    },
    experimental: {
        serverComponentsExternalPackages: ["mongodb"],
    },
};

export default nextConfig;
