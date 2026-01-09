module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongodb$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs, [project]/node_modules/mongodb)");
;
const uri = process.env.MONGODB_URI;
const options = {};
if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
}
let client;
let clientPromise;
if ("TURBOPACK compile-time truthy", 1) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!/*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise) {
        client = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongodb$29$__["MongoClient"](uri, options);
        /*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise = client.connect();
    }
    clientPromise = /*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise;
} else //TURBOPACK unreachable
;
const __TURBOPACK__default__export__ = clientPromise;
}),
"[project]/src/services/dataService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAffiliateLinkByCode",
    ()=>getAffiliateLinkByCode,
    "getAffiliateLinks",
    ()=>getAffiliateLinks,
    "getProductBySlug",
    ()=>getProductBySlug,
    "getProducts",
    ()=>getProducts,
    "getUserById",
    ()=>getUserById,
    "getUsers",
    ()=>getUsers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mongodb.ts [app-route] (ecmascript)");
;
let client;
let productsCollection;
let affiliateLinksCollection;
let usersCollection;
async function init() {
    if (client && client.isConnected()) {
        return;
    }
    try {
        client = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"];
        const db = client.db('affiliate_hub'); // Assuming database name is 'affiliate_hub'
        productsCollection = db.collection('products');
        affiliateLinksCollection = db.collection('affiliateLinks');
        usersCollection = db.collection('users');
    } catch (error) {
        console.error('Failed to connect to DB or get collections:', error);
        throw new Error('Database initialization failed');
    }
}
async function getProducts() {
    await init();
    return productsCollection.find({}).toArray();
}
async function getProductBySlug(slug) {
    await init();
    return productsCollection.findOne({
        slug
    });
}
async function getAffiliateLinks() {
    await init();
    return affiliateLinksCollection.find({}).toArray();
}
async function getAffiliateLinkByCode(code) {
    await init();
    return affiliateLinksCollection.findOne({
        code
    });
}
async function getUsers() {
    await init();
    return usersCollection.find({}).toArray();
}
async function getUserById(id) {
    await init();
    return usersCollection.findOne({
        id
    });
}
}),
"[project]/src/app/api/checkout/[productSlug]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$dataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/dataService.ts [app-route] (ecmascript)");
;
;
async function GET(request, context) {
    try {
        const { productSlug } = context.params;
        const { searchParams } = new URL(request.url);
        const refCode = searchParams.get('ref');
        if (!refCode) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Referral code is missing'
            }, {
                status: 400
            });
        }
        const affiliateLink = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$dataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAffiliateLinkByCode"])(refCode);
        if (!affiliateLink) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid affiliate link'
            }, {
                status: 404
            });
        }
        const product = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$dataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProductBySlug"])(productSlug);
        if (!product || product.id !== affiliateLink.productId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Product not found or mismatch'
            }, {
                status: 404
            });
        }
        const affiliator = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$dataService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserById"])(affiliateLink.affiliatorId);
        if (!affiliator || affiliator.status !== 'approved') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Affiliator not found or not approved'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            product,
            affiliateLink,
            affiliator
        });
    } catch (error) {
        console.error('API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1e43ca73._.js.map