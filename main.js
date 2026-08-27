// MERGED SINGLE-FILE VERSION
// Original project logic is embedded without changing its application behavior.
const { getApps, getApp, initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, deleteDoc, getDocs, collection } = require('firebase/firestore');
const FIREBASE_CONFIG = {
  "projectId": "calcium-medium-1zp2g",
  "appId": "1:374499579980:web:80f5c836132daf07fd7ce9",
  "apiKey": "AIzaSyBLNq9vnIB_K5YJhWnaGiSy6KXOzXto_mk",
  "authDomain": "calcium-medium-1zp2g.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-qamifyresellerbo-2e9baaaf-7053-484d-b305-9e90901f338e",
  "storageBucket": "calcium-medium-1zp2g.firebasestorage.app",
  "messagingSenderId": "374499579980",
  "measurementId": "",
  "oAuthClientId": "374499579980-inme5kn6dd31f4r8cfe9nir7m5et8qej.apps.googleusercontent.com",
  "recaptchaSiteKey": ""
};

const firebaseModule = (() => {
  const exports = {};
  const module = { exports };
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.firestoreDb = void 0;
const app_1 = { getApps, getApp, initializeApp };
const firestore_1 = { getFirestore };
const firebase_applet_config_json_1 = { default: FIREBASE_CONFIG };
const app = (0, app_1.getApps)().length > 0 ? (0, app_1.getApp)() : (0, app_1.initializeApp)(firebase_applet_config_json_1.default);
exports.firestoreDb = (0, firestore_1.getFirestore)(app, firebase_applet_config_json_1.default.firestoreDatabaseId || '(default)');
exports.default = app;

  return module.exports;
})();

const firebaseDbModule = (() => {
  const exports = {};
  const module = { exports };
exports.saveToFirebase = saveToFirebase;
exports.deleteFromFirebase = deleteFromFirebase;
exports.loadCollectionFromFirebase = loadCollectionFromFirebase;
const firebase_1 = firebaseModule;
const firestore_1 = { doc, setDoc, deleteDoc, getDocs, collection };
async function saveToFirebase(colName, id, data) {
    try {
        const docRef = (0, firestore_1.doc)(firebase_1.firestoreDb, colName, String(id));
        await (0, firestore_1.setDoc)(docRef, JSON.parse(JSON.stringify(data)), { merge: true });
    }
    catch (err) {
        console.error(`[Firebase Firestore] Error saving to ${colName}/${id}:`, err);
    }
}
async function deleteFromFirebase(colName, id) {
    try {
        const docRef = (0, firestore_1.doc)(firebase_1.firestoreDb, colName, String(id));
        await (0, firestore_1.deleteDoc)(docRef);
    }
    catch (err) {
        console.error(`[Firebase Firestore] Error deleting ${colName}/${id}:`, err);
    }
}
async function loadCollectionFromFirebase(colName) {
    try {
        const querySnapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.firestoreDb, colName));
        const list = [];
        querySnapshot.forEach(d => {
            list.push({ id: d.id, ...d.data() });
        });
        return list;
    }
    catch (err) {
        console.error(`[Firebase Firestore] Error loading collection ${colName}:`, err);
        return [];
    }
}

  return module.exports;
})();

const pricingModule = (() => {
  const exports = {};
  const module = { exports };
// Store Pricing Formula: (originalPriceUSD + 0.45) * 190
exports.DEFAULT_MARKUP_USD = exports.DEFAULT_EXCHANGE_RATE = void 0;
exports.getPricingSettings = getPricingSettings;
exports.updatePricingSettings = updatePricingSettings;
exports.calculateETBPrice = calculateETBPrice;
exports.DEFAULT_EXCHANGE_RATE = 190; // ETB per USD
exports.DEFAULT_MARKUP_USD = 0.45; // USD markup per product
const globalPricing = global;
if (!globalPricing.__nexora_pricing_settings) {
    globalPricing.__nexora_pricing_settings = {
        exchangeRate: exports.DEFAULT_EXCHANGE_RATE,
        markupUSD: exports.DEFAULT_MARKUP_USD,
        maxPaymentAgeMinutes: 15
    };
}
function getPricingSettings() {
    return globalPricing.__nexora_pricing_settings;
}
function updatePricingSettings(settings) {
    globalPricing.__nexora_pricing_settings = {
        ...globalPricing.__nexora_pricing_settings,
        ...settings
    };
    return globalPricing.__nexora_pricing_settings;
}
/**
 * Calculates ETB price from original USD price using formula:
 * Price ETB = (Price USD + 0.45) * 190
 */
function calculateETBPrice(priceUSD) {
    const usd = Number(priceUSD || 0);
    const { exchangeRate, markupUSD } = getPricingSettings();
    if (usd <= 0) {
        return Math.round(markupUSD * exchangeRate);
    }
    return Math.round((usd + markupUSD) * exchangeRate);
}

  return module.exports;
})();

const qamifyModule = (() => {
  const exports = {};
  const module = { exports };
exports.extractOriginalUSDPrice = extractOriginalUSDPrice;
exports.normalizeQamifyProduct = normalizeQamifyProduct;
exports.fetchLiveQamifyProducts = fetchLiveQamifyProducts;
exports.placeQamifyOrder = placeQamifyOrder;
const pricing_1 = pricingModule;
/**
 * Extracts exact original USD price from Qamify API response.
 * When sending /v1/products, Qamify returns:
 * "unit_price_cents": 55, "unit_price": "0.55", "currency": "USD"
 * This function extracts unit_price (e.g. 0.55) or unit_price_cents / 100 as the original supplier price.
 */
function extractOriginalUSDPrice(item) {
    if (item.unit_price !== undefined && item.unit_price !== null && item.unit_price !== '') {
        const val = parseFloat(String(item.unit_price));
        if (!isNaN(val) && val > 0)
            return Number(val.toFixed(2));
    }
    if (item.unit_price_cents !== undefined && item.unit_price_cents !== null) {
        const cents = Number(item.unit_price_cents);
        if (!isNaN(cents) && cents > 0)
            return Number((cents / 100).toFixed(2));
    }
    const fallbackFields = [
        item.priceUSD,
        item.price_usd,
        item.original_price,
        item.originalPrice,
        item.cost,
        item.supplier_price,
        item.buy_price,
        item.price
    ];
    for (const field of fallbackFields) {
        if (field !== undefined && field !== null && field !== '') {
            const val = parseFloat(String(field));
            if (!isNaN(val) && val > 0)
                return Number(val.toFixed(2));
        }
    }
    return 0.55;
}
/**
 * Normalizes raw Qamify API product item into full store Product
 * Strictly applying pricing formula: (unit_price + 0.45) * 190 ETB
 */
function normalizeQamifyProduct(item, index = 0) {
    const usdPrice = extractOriginalUSDPrice(item);
    const etbPrice = (0, pricing_1.calculateETBPrice)(usdPrice);
    const stockCount = item.stock !== undefined
        ? Number(item.stock)
        : item.in_stock === false ? 0 : 50;
    return {
        id: String(item.id || item.product_id || `qamify-${index + 1}`),
        name: item.name || item.title || 'Digital Product',
        description: item.description || item.desc || 'Instant automated digital delivery.',
        priceUSD: usdPrice,
        price: etbPrice,
        stock: stockCount,
        category: item.category || 'Digital Services',
        deliveryType: 'instant',
        instructions: 'Delivered instantly upon successful payment verification.'
    };
}
/**
 * Fetch live products from Qamify API endpoint /v1/products
 */
async function fetchLiveQamifyProducts() {
    const apiKey = 'qamify_9713b8cd438598710bf410735c6f692aaba9ebc244715430';
    if (!apiKey || apiKey === 'YOUR_QAMIFY_API_KEY') {
        return [];
    }
    try {
        const res = await fetch('https://api.qamify.site/v1/products', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        if (!res.ok) {
            console.error(`Qamify API returned status ${res.status}: ${res.statusText}`);
            return [];
        }
        const data = await res.json();
        let rawItems = [];
        if (Array.isArray(data)) {
            rawItems = data;
        }
        else if (data && Array.isArray(data.data)) {
            rawItems = data.data;
        }
        else if (data && Array.isArray(data.products)) {
            rawItems = data.products;
        }
        else if (data && typeof data === 'object') {
            const arr = Object.values(data).find(v => Array.isArray(v));
            if (arr)
                rawItems = arr;
        }
        if (rawItems.length > 0) {
            return rawItems.map((item, idx) => normalizeQamifyProduct(item, idx));
        }
    }
    catch (err) {
        console.error('Failed to fetch live products from Qamify:', err);
    }
    return [];
}
/**
 * Places an automated supplier order on Qamify API
 * Endpoint: POST https://api.qamify.site/v1/orders
 * Headers:
 * - Authorization: Bearer qamify_9713b8cd438598710bf410735c6f692aaba9ebc244715430
 * - Idempotency-Key: order-<timestamp>-<rand>
 * - Content-Type: application/json
 * Body: { "product_id": 10, "qty": 1 }
 */
function extractQamifyFulfillment(payload) {
    const preferredKeys = new Set([
        'license_key','licenseKey','license','key','keys','code','codes',
        'voucher','vouchers','voucher_code','voucherCode','redeem_code','redeemCode',
        'activation_code','activationCode','activation_key','activationKey',
        'activation_link','activationLink','redeem_link','redeemLink',
        'subscription_link','subscriptionLink','purchase_link','purchaseLink',
        'service_link','serviceLink','download_link','downloadLink',
        'delivery','delivery_data','deliveryData','delivery_content','deliveryContent',
        'content','value','credentials','credential','login','account','account_details',
        'accountDetails','username','email','password','token','access_token','accessToken',
        'url','link','links','fulfillment','fulfilment','fulfillment_data','fulfillmentData',
        'delivery_url','deliveryUrl','result_url','resultUrl','output','response'
    ]);
    const containerKeys = new Set([
        'data','result','order','product','response','delivery','fulfillment','fulfilment',
        'details','output','payload','item','items','attributes','meta','metadata'
    ]);
    const seen = new Set();
    const candidates = [];

    const normalize = (value) => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        if (Array.isArray(value)) {
            const parts = value.map(normalize).filter(Boolean);
            return parts.length ? parts.join('\n') : '';
        }
        if (typeof value === 'object') {
            // Keep useful credential objects readable without exposing unrelated response metadata.
            const parts = [];
            for (const [k, v] of Object.entries(value)) {
                const nv = normalize(v);
                if (nv && (preferredKeys.has(k) || typeof v !== 'object')) parts.push(`${k}: ${nv}`);
            }
            return parts.join('\n');
        }
        return '';
    };

    const scoreString = (key, value) => {
        const v = String(value || '').trim();
        if (!v) return -Infinity;
        let score = 0;
        const lk = String(key || '').toLowerCase();
        if (preferredKeys.has(key) || preferredKeys.has(lk)) score += 100;
        if (/^https?:\/\//i.test(v)) score += 90;
        if (/serviceactivation\.google\.com/i.test(v)) score += 120;
        if (/^(?:https?:\/\/|www\.)/i.test(v)) score += 20;
        if (/\b(license|voucher|activation|redeem|subscription|credential|password|username|access|delivery|fulfillment)\b/i.test(lk)) score += 50;
        if (v.length >= 8 && v.length <= 5000) score += 5;
        // Avoid selecting ordinary API status messages as fulfillment.
        if (/^(ok|success|successful|completed|pending|created|order placed|order successful)$/i.test(v)) score -= 200;
        return score;
    };

    const visit = (value, key = '', depth = 0) => {
        if (value === undefined || value === null || depth > 12) return;
        if (typeof value === 'object') {
            if (seen.has(value)) return;
            seen.add(value);
            if (Array.isArray(value)) {
                for (const item of value) visit(item, key, depth + 1);
                return;
            }
            for (const [k, v] of Object.entries(value)) {
                if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                    const normalized = String(v).trim();
                    const score = scoreString(k, normalized);
                    if (score > -Infinity) candidates.push({ score, value: normalized, key: k });
                } else if (Array.isArray(v)) {
                    const normalized = normalize(v);
                    if (normalized) {
                        const score = scoreString(k, normalized);
                        if (score > -Infinity) candidates.push({ score, value: normalized, key: k });
                    }
                }
                visit(v, k, depth + 1);
            }
            return;
        }
        const normalized = String(value).trim();
        if (normalized) candidates.push({ score: scoreString(key, normalized), value: normalized, key });
    };

    visit(payload);
    candidates.sort((a, b) => b.score - a.score);

    // Prefer an actual URL anywhere in the response, especially activation/redeem links.
    const urlCandidate = candidates.find(c => /^https?:\/\//i.test(c.value));
    if (urlCandidate) return urlCandidate.value;

    const best = candidates.find(c => c.score > 0);
    return best ? best.value : undefined;
}

async function placeQamifyOrder(productId, qty = 1) {
    const apiKey = 'qamify_9713b8cd438598710bf410735c6f692aaba9ebc244715430';
    const numericId = Number(productId);
    const targetProductId = !isNaN(numericId) && numericId > 0 ? numericId : productId;
    const targetQty = Math.max(1, Number(qty) || 1);
    const timestamp = Math.floor(Date.now() / 1000);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const idempotencyKey = `order-${timestamp}-${randomSuffix}`;
    try {
        const res = await fetch('https://api.qamify.site/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Idempotency-Key': idempotencyKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ product_id: targetProductId, qty: targetQty })
        });
        const responseText = await res.text();
        let resData = {};
        try { resData = JSON.parse(responseText); }
        catch { resData = { raw: responseText }; }

        if (!res.ok) {
            console.error(`Qamify order API error (${res.status}):`, resData);
            const errMsg = resData?.message ||
                (typeof resData?.error === 'string' ? resData.error : resData?.error?.message) ||
                (resData?.error ? JSON.stringify(resData.error) : `Qamify API returned status ${res.status}`);
            return { success: false, message: errMsg, data: resData };
        }

        const licenseKey = extractQamifyFulfillment(resData);
        console.log('Qamify order successful; fulfillment detected:', licenseKey ? String(licenseKey).slice(0, 200) : 'none');
        if (!licenseKey) console.warn('Qamify order response contained no recognized fulfillment value:', JSON.stringify(resData));

        return {
            success: true,
            message: resData.message || 'Order placed successfully on supplier system.',
            data: resData,
            licenseKey,
            orderId: resData.id || resData.order_id || resData.data?.id || resData.data?.order_id || resData.order?.id || resData.order?.order_id || resData.result?.id || resData.result?.order_id
        };
    } catch (err) {
        console.error('Failed to submit Qamify supplier order:', err);
        return { success: false, message: err.message || 'Failed to communicate with Qamify supplier API.' };
    }
}

  return module.exports;
})();

const storeModule = (() => {
  const exports = {};
  const module = { exports };
exports.DEFAULT_PRODUCTS = void 0;
exports.isTransactionUsed = isTransactionUsed;
exports.markTransactionUsed = markTransactionUsed;
exports.getUsedTransactions = getUsedTransactions;
exports.removeUsedTransaction = removeUsedTransaction;
exports.getProductsList = getProductsList;
exports.addProduct = addProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getUser = getUser;
exports.getAllUsers = getAllUsers;
exports.updateUserBalance = updateUserBalance;
exports.adjustUserBalanceAdmin = adjustUserBalanceAdmin;
exports.setUserBanStatus = setUserBanStatus;
exports.isUserBanned = isUserBanned;
exports.createOrder = createOrder;
exports.getOrderById = getOrderById;
exports.getAllOrders = getAllOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.refundOrderToWallet = refundOrderToWallet;
exports.recordDeposit = recordDeposit;
exports.getDeposits = getDeposits;
exports.getAllPromoCodes = getAllPromoCodes;
exports.createPromoCode = createPromoCode;
exports.deletePromoCode = deletePromoCode;
exports.redeemPromoCode = redeemPromoCode;
exports.getSetting = getSetting;
exports.setSetting = setSetting;
exports.awaitHydration = awaitHydration;
exports.initStoreFromFirebase = initStoreFromFirebase;
const pricing_1 = pricingModule;
const firebaseDb_1 = firebaseDbModule;
// Raw product definitions with original USD prices
// ETB Price is strictly computed as (priceUSD + 0.45) * 190
const INITIAL_CATALOG = [
    {
        id: 'tg-prem-1m',
        name: 'Telegram Premium (1 Month)',
        description: 'Instant 1-Month Telegram Premium gift/subscription directly activated to your username or via gift link. Includes 4GB uploads, faster downloads, voice-to-text, animated emoji & badges.',
        priceUSD: 3.50, // (3.50 + 0.45) * 190 = 751 ETB
        stock: 45,
        category: 'Subscriptions',
        deliveryType: 'instant',
        instructions: 'Sent instantly to your account or via activation code.'
    },
    {
        id: 'tg-prem-3m',
        name: 'Telegram Premium (3 Months)',
        description: '3 Months Telegram Premium subscription. Unlocks all premium features, double limits, custom app icons, real-time translation and exclusive stickers.',
        priceUSD: 8.90, // (8.90 + 0.45) * 190 = 1777 ETB
        stock: 30,
        category: 'Subscriptions',
        deliveryType: 'instant',
        instructions: 'Sent instantly via redeemable gift voucher link.'
    },
    {
        id: 'tg-prem-12m',
        name: 'Telegram Premium (12 Months)',
        description: 'Full 1-Year Telegram Premium subscription at a discounted rate. Instant activation and 12-month validity guaranteed.',
        priceUSD: 26.50, // (26.50 + 0.45) * 190 = 5121 ETB
        stock: 20,
        category: 'Subscriptions',
        deliveryType: 'instant'
    },
    {
        id: 'discord-nitro-1m',
        name: 'Discord Nitro (1 Month Boost)',
        description: 'Full Discord Nitro with 2 Server Boosts, 500MB upload limit, HD streaming (4K 60fps), custom emojis everywhere, and profile banners.',
        priceUSD: 4.80, // (4.80 + 0.45) * 190 = 998 ETB
        stock: 28,
        category: 'Gaming & Social',
        deliveryType: 'instant'
    },
    {
        id: 'spotify-prem-3m',
        name: 'Spotify Premium Individual (3 Months)',
        description: 'Ad-free music listening, offline downloads, unlimited skips, high quality audio on all devices.',
        priceUSD: 4.00, // (4.00 + 0.45) * 190 = 846 ETB
        stock: 50,
        category: 'Entertainment',
        deliveryType: 'instant'
    },
    {
        id: 'netflix-uhd-1m',
        name: 'Netflix 4K Ultra HD (1 Month Profile)',
        description: 'Private 4K Ultra HD Netflix profile with dedicated PIN. Stream movies & series in Dolby Vision & Atmos without interruptions.',
        priceUSD: 2.90, // (2.90 + 0.45) * 190 = 637 ETB
        stock: 18,
        category: 'Entertainment',
        deliveryType: 'instant'
    },
    {
        id: 'pubg-660-uc',
        name: 'PUBG Mobile 660 UC Digital Voucher',
        description: 'Direct PUBG Mobile Unknown Cash digital redeem code (600 + 60 bonus UC). Instant global redeem code on Midasbuy.',
        priceUSD: 5.75, // (5.75 + 0.45) * 190 = 1178 ETB
        stock: 65,
        category: 'Gaming & Topups',
        deliveryType: 'instant'
    },
    {
        id: 'freefire-530-diamonds',
        name: 'Free Fire 530+53 Diamonds Voucher',
        description: 'Garena Free Fire instant digital voucher for 530 + 53 bonus diamonds. Redeemable instantly using Player ID on Garena Topup.',
        priceUSD: 4.40, // (4.40 + 0.45) * 190 = 922 ETB
        stock: 80,
        category: 'Gaming & Topups',
        deliveryType: 'instant'
    },
    {
        id: 'chatgpt-plus-1m',
        name: 'ChatGPT Plus / OpenAI (1 Month Access)',
        description: 'Full access to GPT-4o, DALL-E 3 image generation, Advanced Voice Mode, Canvas, and custom GPTs.',
        priceUSD: 12.00, // (12.00 + 0.45) * 190 = 2366 ETB
        stock: 12,
        category: 'AI & Productivity',
        deliveryType: 'instant'
    },
    {
        id: 'steam-10-usd',
        name: 'Steam Wallet $10 USD Global Key',
        description: '$10 USD Steam Wallet Gift Card redeemable on any Steam region with instant conversion.',
        priceUSD: 10.00, // (10.00 + 0.45) * 190 = 1986 ETB
        stock: 25,
        category: 'Gaming & Topups',
        deliveryType: 'instant'
    },
    {
        id: 'canva-pro-1y',
        name: 'Canva Pro (1 Year Edu/Team Invite)',
        description: 'Full Canva Pro 1-year unlimited access with brand kits, background remover, premium templates, magic studio AI and unlimited cloud storage.',
        priceUSD: 3.20, // (3.20 + 0.45) * 190 = 694 ETB
        stock: 40,
        category: 'AI & Productivity',
        deliveryType: 'instant'
    },
    {
        id: 'youtube-prem-3m',
        name: 'YouTube Premium & Music (3 Months)',
        description: 'Background play, ad-free YouTube videos, YouTube Music Premium streaming, offline downloads on all mobile & TV devices.',
        priceUSD: 4.20, // (4.20 + 0.45) * 190 = 884 ETB
        stock: 35,
        category: 'Entertainment',
        deliveryType: 'instant'
    }
];
exports.DEFAULT_PRODUCTS = INITIAL_CATALOG.map(p => ({
    ...p,
    price: (0, pricing_1.calculateETBPrice)(p.priceUSD)
}));
// Global in-memory storage singleton
const globalStore = global;
if (!globalStore.__nexora_products) {
    globalStore.__nexora_products = exports.DEFAULT_PRODUCTS;
}
if (!globalStore.__nexora_used_txns) {
    globalStore.__nexora_used_txns = {};
}
if (!globalStore.__nexora_users) {
    globalStore.__nexora_users = {};
}
if (!globalStore.__nexora_orders) {
    globalStore.__nexora_orders = {};
}
if (!globalStore.__nexora_deposits) {
    globalStore.__nexora_deposits = {};
}
if (!globalStore.__nexora_promo_codes) {
    globalStore.__nexora_promo_codes = {};
}
/* -------------------------------------------------------------------------- */
/* TRANSACTION ANTI-REPLAY AND DUP VALIDATION                                 */
/* -------------------------------------------------------------------------- */
function isTransactionUsed(txId) {
    if (!txId)
        return false;
    const cleanId = txId.trim().toUpperCase();
    if (globalStore.__nexora_used_txns[cleanId])
        return true;
    // Also check direct match across all keys case-insensitively
    const exists = Object.keys(globalStore.__nexora_used_txns).some(k => k.toUpperCase() === cleanId);
    return exists;
}
function markTransactionUsed(record) {
    const cleanId = record.transactionId.trim().toUpperCase();
    const data = {
        ...record,
        transactionId: cleanId,
        usedAt: record.usedAt || new Date().toISOString()
    };
    globalStore.__nexora_used_txns[cleanId] = data;
    (0, firebaseDb_1.saveToFirebase)('used_txns', cleanId, data);
}
function getUsedTransactions() {
    return Object.values(globalStore.__nexora_used_txns).sort((a, b) => new Date(b.usedAt || 0).getTime() - new Date(a.usedAt || 0).getTime());
}
function removeUsedTransaction(txId) {
    const cleanId = txId.trim().toUpperCase();
    if (globalStore.__nexora_used_txns[cleanId]) {
        delete globalStore.__nexora_used_txns[cleanId];
        (0, firebaseDb_1.deleteFromFirebase)('used_txns', cleanId);
        return true;
    }
    return false;
}
/* -------------------------------------------------------------------------- */
/* PRODUCT MANAGEMENT (CRUD & Auto-Pricing)                                    */
/* -------------------------------------------------------------------------- */
function getProductsList() {
    // Ensure all products reflect current (priceUSD + 0.45) * 190
    return globalStore.__nexora_products.map(p => ({
        ...p,
        price: (0, pricing_1.calculateETBPrice)(p.priceUSD)
    }));
}
function addProduct(item) {
    const newProduct = {
        ...item,
        price: (0, pricing_1.calculateETBPrice)(item.priceUSD),
        createdAt: new Date().toISOString()
    };
    globalStore.__nexora_products.push(newProduct);
    (0, firebaseDb_1.saveToFirebase)('products', String(newProduct.id), newProduct);
    return newProduct;
}
function updateProduct(id, updates, fallback) {
    const strId = String(id);
    let idx = globalStore.__nexora_products.findIndex(p => String(p.id) === strId);
    if (idx === -1) {
        const fromInitial = INITIAL_CATALOG.find(p => String(p.id) === strId);
        const newUSD = updates.priceUSD !== undefined
            ? Number(updates.priceUSD)
            : (fallback?.priceUSD !== undefined ? Number(fallback.priceUSD) : (fromInitial?.priceUSD || 1.0));
        const created = {
            id: strId,
            name: updates.name || fallback?.name || fromInitial?.name || `Product #${strId}`,
            description: updates.description || fallback?.description || fromInitial?.description || 'Instant automated digital delivery.',
            category: updates.category || fallback?.category || fromInitial?.category || 'Digital Services',
            deliveryType: updates.deliveryType || fallback?.deliveryType || fromInitial?.deliveryType || 'instant',
            instructions: updates.instructions || fallback?.instructions || fromInitial?.instructions || 'Instant delivery code.',
            stock: updates.stock !== undefined ? Number(updates.stock) : (fallback?.stock !== undefined ? Number(fallback.stock) : 50),
            ...fallback,
            ...updates,
            priceUSD: newUSD,
            price: (0, pricing_1.calculateETBPrice)(newUSD),
            createdAt: new Date().toISOString()
        };
        globalStore.__nexora_products.push(created);
        (0, firebaseDb_1.saveToFirebase)('products', strId, created);
        return created;
    }
    const existing = globalStore.__nexora_products[idx];
    const newUSD = updates.priceUSD !== undefined
        ? Number(updates.priceUSD)
        : (existing.priceUSD !== undefined ? Number(existing.priceUSD) : 1.0);
    const updated = {
        ...existing,
        ...updates,
        priceUSD: newUSD,
        price: (0, pricing_1.calculateETBPrice)(newUSD)
    };
    globalStore.__nexora_products[idx] = updated;
    (0, firebaseDb_1.saveToFirebase)('products', strId, updated);
    return updated;
}
function deleteProduct(id) {
    const initialLen = globalStore.__nexora_products.length;
    globalStore.__nexora_products = globalStore.__nexora_products.filter(p => String(p.id) !== String(id));
    (0, firebaseDb_1.deleteFromFirebase)('products', String(id));
    return globalStore.__nexora_products.length < initialLen;
}
/* -------------------------------------------------------------------------- */
/* USER & WALLET MANAGEMENT                                                   */
/* -------------------------------------------------------------------------- */
function getUser(userId = 'default_user') {
    if (!globalStore.__nexora_users[userId]) {
        const randomCode = `VEN-${Math.floor(1000 + Math.random() * 9000)}`;
        const newProfile = {
            userId,
            username: userId.startsWith('tg_') ? `TelegramUser_${userId.slice(3, 8)}` : 'VendraSubCustomer',
            balance: 0.00,
            referralCode: randomCode,
            referralCount: 0,
            referralEarnings: 0,
            totalSpent: 0,
            redeemedCodes: [],
            createdAt: new Date().toISOString()
        };
        globalStore.__nexora_users[userId] = newProfile;
        (0, firebaseDb_1.saveToFirebase)('users', userId, newProfile);
    }
    return globalStore.__nexora_users[userId];
}
function getAllUsers() {
    return Object.values(globalStore.__nexora_users).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function updateUserBalance(userId, delta) {
    const user = getUser(userId);
    user.balance = Math.max(0, Number((user.balance + delta).toFixed(2)));
    if (delta < 0) {
        user.totalSpent = Number((user.totalSpent + Math.abs(delta)).toFixed(2));
    }
    (0, firebaseDb_1.saveToFirebase)('users', userId, user);
    return user;
}
function adjustUserBalanceAdmin(userId, amount, _reason) {
    const user = getUser(userId);
    user.balance = Math.max(0, Number((user.balance + amount).toFixed(2)));
    (0, firebaseDb_1.saveToFirebase)('users', userId, user);
    return user;
}
function setUserBanStatus(userId, isBanned, banReason) {
    const user = getUser(userId);
    user.isBanned = isBanned;
    if (isBanned) {
        user.banReason = banReason || 'Violated terms of service or fraudulent activity';
    }
    else {
        delete user.banReason;
    }
    (0, firebaseDb_1.saveToFirebase)('users', userId, user);
    return user;
}
function isUserBanned(userId) {
    const user = getUser(userId);
    return {
        banned: !!user.isBanned,
        reason: user.banReason
    };
}
/* -------------------------------------------------------------------------- */
/* ORDER CREATION & LIFECYCLE                                                 */
/* -------------------------------------------------------------------------- */
function createOrder(orderData) {
    const id = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const order = {
        ...orderData,
        id,
        createdAt: new Date().toISOString()
    };
    globalStore.__nexora_orders[id] = order;
    (0, firebaseDb_1.saveToFirebase)('orders', id, order);
    // Deduct stock if product exists in store
    const prod = globalStore.__nexora_products?.find(p => String(p.id) === String(orderData.productId));
    if (prod && prod.stock !== undefined && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - (orderData.qty || 1));
        (0, firebaseDb_1.saveToFirebase)('products', String(prod.id), prod);
    }
    return order;
}
function getOrderById(orderId) {
    const cleanId = orderId.trim().toUpperCase();
    if (globalStore.__nexora_orders[cleanId]) {
        return globalStore.__nexora_orders[cleanId];
    }
    const found = Object.values(globalStore.__nexora_orders).find(o => o.id.toUpperCase() === cleanId || o.id.toUpperCase() === `ORD-${cleanId}` || (o.transactionRef && o.transactionRef.toUpperCase() === cleanId));
    return found;
}
function getAllOrders(userId) {
    const all = Object.values(globalStore.__nexora_orders);
    if (userId && userId !== 'admin') {
        return all.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function updateOrderStatus(orderId, status, licenseKey) {
    const order = getOrderById(orderId);
    if (!order)
        return null;
    order.status = status;
    if (licenseKey)
        order.licenseKey = licenseKey;
    if (status === 'completed' && !order.verifiedAt) {
        order.verifiedAt = new Date().toISOString();
    }
    (0, firebaseDb_1.saveToFirebase)('orders', order.id, order);
    return order;
}
function refundOrderToWallet(orderId) {
    const order = getOrderById(orderId);
    if (!order) {
        return { success: false, message: 'Order not found.' };
    }
    if (order.status === 'cancelled') {
        return { success: false, message: 'Order is already cancelled/refunded.' };
    }
    order.status = 'cancelled';
    (0, firebaseDb_1.saveToFirebase)('orders', order.id, order);
    updateUserBalance(order.userId, order.totalPrice);
    return {
        success: true,
        message: `Order ${order.id} refunded. ${order.totalPrice} ETB returned to user's wallet.`,
        refundedAmount: order.totalPrice
    };
}
/* -------------------------------------------------------------------------- */
/* DEPOSIT MANAGEMENT                                                         */
/* -------------------------------------------------------------------------- */
function recordDeposit(depositData) {
    const id = `DEP-${Math.floor(1000 + Math.random() * 9000)}`;
    const deposit = {
        ...depositData,
        id,
        createdAt: new Date().toISOString()
    };
    globalStore.__nexora_deposits[id] = deposit;
    (0, firebaseDb_1.saveToFirebase)('deposits', id, deposit);
    return deposit;
}
function getDeposits(userId) {
    const all = Object.values(globalStore.__nexora_deposits);
    if (userId && userId !== 'admin') {
        return all.filter(d => d.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
/* -------------------------------------------------------------------------- */
/* PROMO CODES MANAGEMENT                                                     */
/* -------------------------------------------------------------------------- */
function getAllPromoCodes() {
    return globalStore.__nexora_promo_codes;
}
function createPromoCode(code, reward, maxUses = 1000) {
    const clean = code.trim().toUpperCase();
    const data = {
        reward: Number(reward),
        maxUses: Number(maxUses),
        currentUses: 0
    };
    globalStore.__nexora_promo_codes[clean] = data;
    (0, firebaseDb_1.saveToFirebase)('promo_codes', clean, data);
    return true;
}
function deletePromoCode(code) {
    const clean = code.trim().toUpperCase();
    if (globalStore.__nexora_promo_codes[clean]) {
        delete globalStore.__nexora_promo_codes[clean];
        (0, firebaseDb_1.deleteFromFirebase)('promo_codes', clean);
        return true;
    }
    return false;
}
function redeemPromoCode(userId, rawCode) {
    const code = rawCode.trim().toUpperCase();
    const user = getUser(userId);
    if (user.redeemedCodes.includes(code)) {
        return { success: false, message: `Promo code "${code}" has already been redeemed by your account.` };
    }
    const promo = globalStore.__nexora_promo_codes[code];
    if (!promo) {
        return { success: false, message: `Invalid promo code "${code}". Please check and try again.` };
    }
    if (promo.currentUses >= promo.maxUses) {
        return { success: false, message: `Promo code "${code}" has reached its maximum usage limit.` };
    }
    // Redeem
    promo.currentUses += 1;
    (0, firebaseDb_1.saveToFirebase)('promo_codes', code, promo);
    user.redeemedCodes.push(code);
    updateUserBalance(userId, promo.reward);
    return {
        success: true,
        message: `Promo code redeemed successfully! +${promo.reward} ETB has been added to your wallet balance.`,
        amount: promo.reward
    };
}

/* -------------------------------------------------------------------------- */
/* SYSTEM SETTINGS & BOT CONTROLS                                             */
/* -------------------------------------------------------------------------- */
function getSetting(key) {
    if (!globalStore.__nexora_settings) {
        globalStore.__nexora_settings = {};
    }
    return globalStore.__nexora_settings[key];
}
function setSetting(key, value) {
    if (!globalStore.__nexora_settings) {
        globalStore.__nexora_settings = {};
    }
    globalStore.__nexora_settings[key] = value;
    (0, firebaseDb_1.saveToFirebase)('system_settings', key, { key, value });
}
let isFirebaseHydrated = false;
let hydrationPromise = null;
async function awaitHydration() {
    if (isFirebaseHydrated)
        return;
    if (!hydrationPromise) {
        hydrationPromise = initStoreFromFirebase();
    }
    await hydrationPromise;
}
async function initStoreFromFirebase() {
    if (isFirebaseHydrated)
        return;
    try {
        const [fbProducts, fbUsers, fbOrders, fbDeposits, fbTxns, fbPromos, fbSettings] = await Promise.all([
            (0, firebaseDb_1.loadCollectionFromFirebase)('products'),
            (0, firebaseDb_1.loadCollectionFromFirebase)('users'),
            (0, firebaseDb_1.loadCollectionFromFirebase)('orders'),
            (0, firebaseDb_1.loadCollectionFromFirebase)('deposits'),
            (0, firebaseDb_1.loadCollectionFromFirebase)('used_txns'),
            (0, firebaseDb_1.loadCollectionFromFirebase)('promo_codes'),
            (0, firebaseDb_1.loadCollectionFromFirebase)('system_settings')
        ]);
        if (fbProducts && fbProducts.length > 0) {
            fbProducts.forEach(p => {
                const idx = globalStore.__nexora_products.findIndex(x => String(x.id) === String(p.id));
                if (idx >= 0) {
                    globalStore.__nexora_products[idx] = { ...globalStore.__nexora_products[idx], ...p };
                }
                else {
                    globalStore.__nexora_products.push(p);
                }
            });
        }
        if (fbUsers && fbUsers.length > 0) {
            fbUsers.forEach(u => {
                globalStore.__nexora_users[String(u.userId)] = u;
            });
        }
        if (fbOrders && fbOrders.length > 0) {
            fbOrders.forEach(o => {
                globalStore.__nexora_orders[String(o.id)] = o;
            });
        }
        if (fbDeposits && fbDeposits.length > 0) {
            fbDeposits.forEach(d => {
                globalStore.__nexora_deposits[String(d.id)] = d;
            });
        }
        if (fbTxns && fbTxns.length > 0) {
            fbTxns.forEach(t => {
                globalStore.__nexora_used_txns[String(t.transactionId).toUpperCase()] = t;
            });
        }
        if (fbPromos && fbPromos.length > 0) {
            fbPromos.forEach(pr => {
                globalStore.__nexora_promo_codes[String(pr.id).toUpperCase()] = {
                    reward: pr.reward,
                    maxUses: pr.maxUses,
                    currentUses: pr.currentUses
                };
            });
        }
        if (fbSettings && fbSettings.length > 0) {
            fbSettings.forEach(s => {
                globalStore.__nexora_settings[s.key || s.id] = s.value;
            });
        }
        isFirebaseHydrated = true;
    }
    catch (err) {
        console.error('Error hydrating store from Firebase:', err);
    }
}
// Automatically trigger Firebase hydration in background
initStoreFromFirebase().catch(() => { });

  return module.exports;
})();

const veritasModule = (() => {
  const exports = {};
  const module = { exports };
exports.PAYMENT_CONFIG = void 0;
exports.verifyPaymentWithVeritas = verifyPaymentWithVeritas;
const store_1 = storeModule;
const VERITAS_BASE_URL = 'https://verifyapi.leulzenebe.pro';
const VERITAS_API_KEY = 'sk_live_d82a6778a32490185e6eed0fbc2a00da0be3fe2467a4d8d3';
exports.PAYMENT_CONFIG = {
    telebirr: {
        name: 'Telebirr',
        accountNumber: '0967197797',
        accountName: 'SINTAYEHU DEBELA ANGESA',
        instructions: 'Send money using Telebirr to 0967197797 (SINTAYEHU DEBELA ANGESA), copy the Transaction Number/ID from the SMS receipt, and enter it below.'
    },
    cbe: {
        name: 'CBE (Commercial Bank of Ethiopia)',
        accountNumber: 'Disabled',
        accountName: 'CBE Currently Unavailable',
        instructions: 'CBE payments are temporarily unavailable. Please use Telebirr (0967197797 - SINTAYEHU DEBELA ANGESA) or Wallet Deposit.'
    }
};
/**
 * Extracts and calculates transaction timestamp age in minutes.
 */
function extractTransactionAgeMinutes(data) {
    if (!data)
        return {};
    const candidates = [
        data.transaction_time,
        data.trans_time,
        data.timestamp,
        data.date,
        data.trans_date,
        data.created_at,
        data.time,
        data.data?.time,
        data.data?.date,
        data.data?.transaction_time,
        data.data?.timestamp,
        data.paymentDate,
        data.data?.paymentDate
    ];
    for (const c of candidates) {
        if (!c)
            continue;
        let dateString = String(c);
        const ddmmMatch = dateString.match(/^(\d{2})-(\d{2})-(\d{4})\s*(.*)$/);
        if (ddmmMatch) {
            dateString = ddmmMatch[2] + "-" + ddmmMatch[1] + "-" + ddmmMatch[3] + " " + ddmmMatch[4];
        }
        const parsedTime = new Date(dateString).getTime();
        if (!isNaN(parsedTime) && parsedTime > 0) {
            const now = Date.now();
            const diffMs = now - parsedTime;
            const ageMinutes = Math.max(0, Math.round(diffMs / (60 * 1000)));
            return {
                txTimestamp: new Date(parsedTime).toISOString(),
                ageMinutes
            };
        }
    }
    return {};
}
/**
 * Verifies a real live payment transaction with Veritas.et API
 * Endpoint: POST https://verifyapi.leulzenebe.pro/verify
 *
 * Strict rules enforced:
 * 1. CBE disabled completely.
 * 2. Receiver name MUST match "SINTAYEHU DEBELA ANGESA".
 * 3. Payment MUST NOT be older than 15 minutes.
 * 4. Duplicate transaction IDs strictly rejected.
 * 5. Underpaid amounts (verified < required) rejected.
 */
async function verifyPaymentWithVeritas(params) {
    const { transactionId, method, expectedAmount, isDeposit } = params;
    // 1. Check CBE availability
    if (method === 'cbe') {
        return {
            success: false,
            message: 'CBE payments are currently disabled/unavailable. Please use Telebirr (0967197797 - SINTAYEHU DEBELA ANGESA).'
        };
    }
    if (!transactionId || transactionId.trim().length === 0) {
        return {
            success: false,
            message: 'Please provide a valid transaction reference or ID.'
        };
    }
    const cleanTxId = transactionId.trim();
    // 2. Anti-Replay Check: Reject duplicate/already-used transaction ID
    if ((0, store_1.isTransactionUsed)(cleanTxId)) {
        return {
            success: false,
            message: `Transaction ID "${cleanTxId}" has already been claimed or processed. Duplicate transactions are strictly rejected.`
        };
    }
    // 3. Call Veritas.et real live API endpoint
    try {
        const payload = {
            transaction_id: cleanTxId,
            trans_id: cleanTxId,
            transactionId: cleanTxId,
            tx_id: cleanTxId,
            reference: cleanTxId,
            method: method.toLowerCase(),
            provider: method.toLowerCase(),
            amount: expectedAmount,
            api_key: VERITAS_API_KEY
        };
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let response;
        try {
            response = await fetch(`${VERITAS_BASE_URL}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VERITAS_API_KEY}`,
                'x-api-key': VERITAS_API_KEY
            },
            body: JSON.stringify(payload),
            signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }
        const responseText = await response.text();
        let data = {};
        try {
            data = JSON.parse(responseText);
        }
        catch {
            data = { rawResponse: responseText };
        }
        // Check if response indicates verification success
        const isVerified = data.status === 'success' ||
            data.status === 'verified' ||
            data.verified === true ||
            data.success === true ||
            (data.data && (data.data.status === 'success' || data.data.verified === true));
        if (!isVerified) {
            const errorMsg = data?.message || data?.error || data?.detail || 'Transaction verification rejected by payment provider.';
            return {
                success: false,
                message: errorMsg,
                data
            };
        }
        // 4. Receiver Name Matching: MUST match SINTAYEHU DEBELA ANGESA
        const expectedName = 'SINTAYEHU DEBELA ANGESA';
        const targetKeywords = ['SINTAYEHU', 'DEBELA', 'ANGESA'];
        const receiverCandidates = [
            data.receiver,
            data.recipient,
            data.receiver_name,
            data.recipient_name,
            data.to_name,
            data.trans_receiver,
            data.payee,
            data.data?.receiver,
            data.data?.recipient,
            data.data?.receiver_name,
            data.data?.recipient_name,
            data.data?.to_name,
            data.data?.trans_receiver,
            data.data?.payee,
            data.creditedPartyName,
            data.data?.creditedPartyName
        ];
        let nameMatched = false;
        for (const cand of receiverCandidates) {
            if (typeof cand === 'string' && cand.trim().length > 0) {
                const upperCand = cand.toUpperCase();
                if (targetKeywords.every(kw => upperCand.includes(kw))) {
                    nameMatched = true;
                    break;
                }
            }
        }
        if (!nameMatched) {
            const fullJson = JSON.stringify(data).toUpperCase();
            if (targetKeywords.every(kw => fullJson.includes(kw))) {
                nameMatched = true;
            }
        }
        if (!nameMatched) {
            return {
                success: false,
                message: `Receiver name does not exactly match "${expectedName}". Payment was transferred to a different account.`,
                data
            };
        }
        // 5. Strict Time Limit: Must NOT be older than 15 minutes
        const { txTimestamp, ageMinutes } = extractTransactionAgeMinutes(data);
        const maxAgeMinutes = 15;
        if (ageMinutes === undefined) {
            return {
                success: false,
                message: `Could not verify transaction time. The timestamp is missing or invalid.`,
                data,
                transactionId: cleanTxId
            };
        }
        if (ageMinutes > maxAgeMinutes) {
            return {
                success: false,
                message: `Transaction was completed ${ageMinutes} minutes ago. Payments older than 15 minutes are strictly rejected.`,
                data,
                transactionId: cleanTxId,
                ageMinutes,
                txTimestamp
            };
        }
        // 6. Verified Amount Check
        const rawAmount = data.settledAmount ?? data.amount ?? data.data?.settledAmount ?? data.data?.amount ?? data.trans_amount ?? data.verified_amount ?? data.totalPaidAmount ?? data.data?.totalPaidAmount;
        let verifiedAmount = parseFloat(String(rawAmount).replace(/[^0-9.]/g, ""));
        if (isNaN(verifiedAmount))
            verifiedAmount = expectedAmount || 0;
        if (expectedAmount !== undefined && expectedAmount > 0) {
            if (isDeposit) {
                if (verifiedAmount !== expectedAmount) {
                    return {
                        success: false,
                        message: `Deposit rejected: you must send the EXACT amount you entered to deposit (${expectedAmount} ETB). Verified amount was ${verifiedAmount} ETB.`,
                        data,
                        transactionId: cleanTxId,
                        amount: verifiedAmount,
                        method
                    };
                }
            }
            else {
                if (verifiedAmount < expectedAmount) {
                    return {
                        success: false,
                        message: `Verified amount (${verifiedAmount} ETB) is lower than required (${expectedAmount} ETB). Order declined.`,
                        data,
                        transactionId: cleanTxId,
                        amount: verifiedAmount,
                        method
                    };
                }
            }
        }
        return {
            success: true,
            message: data.message || `Transaction ${cleanTxId} verified successfully for ${verifiedAmount} ETB.`,
            data,
            transactionId: cleanTxId,
            amount: verifiedAmount,
            sender: data.sender || data.payer || data.customer_name || 'Verified Customer',
            method,
            txTimestamp,
            ageMinutes: ageMinutes || 1
        };
    }
    catch (error) {
        console.error('Payment API live network error:', error);
        return {
            success: false,
            message: error?.name === 'AbortError'
                ? 'Payment verification timed out after 15 seconds. Please try again.'
                : `Verification system error: ${error.message || 'Unable to connect to verification server'}.`
        };
    }
}

  return module.exports;
})();

const botModule = (() => {
  const exports = {};
  const module = { exports };
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.initBot = initBot;
exports.getBotInstance = getBotInstance;
exports.getBotHealth = getBotHealth;
exports.broadcastToUsers = broadcastToUsers;
const node_telegram_bot_api_1 = { default: require("node-telegram-bot-api") };
const http = require('http');
const store_1 = storeModule;
const veritas_1 = veritasModule;
const pricing_1 = pricingModule;
const qamify_1 = qamifyModule;
let botInstance = null;
const userStates = {};
function escapeHtml(str) {
    if (str === null || str === undefined)
        return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function initBot() {
    if (botInstance)
        return;
    const token = '8613316060:AAEDMV672UQSNMSJrzg0ETq2halipLbb7l4';
    if (!token) {
        console.error('No Telegram bot token found. Bot will not start.');
        return;
    }
    try {
        // Render webhook mode. Render provides PORT and RENDER_EXTERNAL_URL.
        const bot = new node_telegram_bot_api_1.default(token, { polling: false });
        botInstance = bot;
        const port = Number(process.env.PORT || 10000);
        const externalUrl = String(process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
        const webhookPath = '/webhook';
        const webhookUrl = externalUrl ? `${externalUrl}${webhookPath}` : '';

        if (!webhookUrl) {
            console.error('RENDER_EXTERNAL_URL is not set; webhook cannot be registered.');
        }

        const server = http.createServer(async (req, res) => {
            if (req.method === 'GET' && req.url === '/') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('VendraSub bot is running');
                return;
            }
            if (req.method !== 'POST' || req.url !== webhookPath) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            let body = '';
            req.setEncoding('utf8');
            req.on('data', chunk => {
                body += chunk;
                if (body.length > 5 * 1024 * 1024) req.destroy();
            });
            req.on('end', async () => {
                try {
                    const update = JSON.parse(body || '{}');
                    await bot.processUpdate(update);
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('OK');
                } catch (err) {
                    console.error('Webhook update error:', err?.message || err);
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('OK');
                }
            });
        });

        server.on('error', err => console.error('HTTP server error:', err));
        server.listen(port, '0.0.0.0', async () => {
            console.log(`HTTP server listening on port ${port}`);
            if (webhookUrl) {
                try {
                    await bot.setWebHook(webhookUrl);
                    console.log(`Telegram webhook registered: ${webhookUrl}`);
                    // Re-apply commands after webhook registration so Telegram has
                    // the final command scope/menu configuration for this deployment.
                    await configureCommandMenu();
                } catch (err) {
                    console.error('Failed to register Telegram webhook:', err?.message || err);
                }
            }
        });

        bot.on('error', (err) => {
            console.warn('Telegram bot warning:', err?.message || err);
        });

        // Helper to safely send message with HTML fallback to plain text
        async function safeSendMessage(chatId, text, options = {}) {
            try {
                return await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...options });
            }
            catch (err) {
                console.warn('HTML send failed, attempting plain fallback:', err?.message);
                const cleanText = text.replace(/<[^>]*>?/gm, '');
                return await bot.sendMessage(chatId, cleanText, { ...options, parse_mode: undefined });
            }
        }
        // Helper to safely edit message text with HTML fallback and sendMessage fallback
        async function safeEditMessage(chatId, messageId, text, options = {}) {
            try {
                return await bot.editMessageText(text, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    ...options
                });
            }
            catch (err) {
                if (err?.message?.includes('message is not modified')) {
                    return true;
                }
                try {
                    const cleanText = text.replace(/<[^>]*>?/gm, '');
                    return await bot.editMessageText(cleanText, {
                        chat_id: chatId,
                        message_id: messageId,
                        ...options,
                        parse_mode: undefined
                    });
                }
                catch (fallbackErr) {
                    // If message edit fails completely (e.g. message too old, deleted, or prompt message), deliver via safeSendMessage
                    return await safeSendMessage(chatId, text, {
                        reply_markup: options.reply_markup
                    });
                }
            }
        }
        // Mandatory membership gate: users must remain in BOTH the required group and channel.
        // Hardcoded as requested. Admins are exempt so they can manage the bot even if they are not members.
        const REQUIRED_GROUP_ID = -1003927927908;
        const REQUIRED_GROUP_URL = 'https://t.me/VendraSub';
        const REQUIRED_CHANNEL_ID = -1004445657258;
        const REQUIRED_CHANNEL_URL = 'https://t.me/VendraSubET';

        function isMembershipAllowedStatus(member) {
            if (!member) return false;
            if (member.status === 'creator' || member.status === 'administrator' || member.status === 'member') return true;
            if (member.status === 'restricted') return member.is_member === true;
            return false;
        }

        async function checkRequiredMembership(userId) {
            if (isAdminTgUser(userId)) return { ok: true };
            try {
                const [groupMember, channelMember] = await Promise.all([
                    bot.getChatMember(REQUIRED_GROUP_ID, userId),
                    bot.getChatMember(REQUIRED_CHANNEL_ID, userId)
                ]);
                return {
                    ok: isMembershipAllowedStatus(groupMember) && isMembershipAllowedStatus(channelMember),
                    groupOk: isMembershipAllowedStatus(groupMember),
                    channelOk: isMembershipAllowedStatus(channelMember)
                };
            } catch (err) {
                console.error('Membership check failed:', err?.message || err);
                return { ok: false, groupOk: false, channelOk: false, checkError: true };
            }
        }

        async function sendJoinRequired(chatId, membership = {}) {
            let text = `<b>Join Required</b>\n\nYou must join both the official group and channel before using Vendra Sub.`;
            if (membership.checkError) {
                text += `\n\nMembership could not be verified right now. Please make sure the bot is an administrator in both chats, then tap <b>I've Joined</b>.`;
            } else {
                if (!membership.groupOk) text += `\n\n❌ Group: <b>Not joined</b>`;
                else text += `\n\n✅ Group: Joined`;
                if (!membership.channelOk) text += `\n❌ Channel: <b>Not joined</b>`;
                else text += `\n✅ Channel: Joined`;
            }
            text += `\n\nAfter joining, tap <b>I've Joined</b> to verify. You must remain a member to continue using the bot.`;
            return safeSendMessage(chatId, text, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Join Group', url: REQUIRED_GROUP_URL }],
                        [{ text: 'Join Channel', url: REQUIRED_CHANNEL_URL }],
                        [{ text: "I've Joined", callback_data: 'check_membership' }]
                    ]
                }
            });
        }

        // Check if user is banned
        function checkUserBanned(chatId) {
            const banInfo = (0, store_1.isUserBanned)(`tg_${chatId}`);
            if (banInfo.banned) {
                safeSendMessage(chatId, `⛔ <b>Access Denied: Account Banned</b>\n\n` +
                    `Your account has been restricted by an administrator.\n` +
                    `<b>Reason:</b> ${escapeHtml(banInfo.reason || 'Violation of Terms of Service')}\n\n` +
                    `If you believe this is a mistake, contact official support: <a href="https://t.me/VendraSubET">@VendraSubET</a>`);
                return true;
            }
            return false;
        }
        // Authorized Telegram Admin IDs (8453713398 and 7274301492)
        const ALLOWED_ADMIN_TG_IDS = [8453713398, 7274301492];
        function isAdminTgUser(chatId) {
            const numericId = typeof chatId === 'number' ? chatId : Number(String(chatId).replace('tg_', ''));
            return ALLOWED_ADMIN_TG_IDS.includes(numericId);
        }
        // Purchase logging: send completed purchases to the hardcoded log group.
        const PURCHASE_LOG_GROUP_ID = -1003927927908;
        function maskTelegramId(id) {
            const raw = String(id).replace(/^tg_/, '');
            if (raw.length <= 4) return raw;
            return raw.slice(0, 3) + '***' + raw.slice(-2);
        }
        async function logPurchaseToGroup({ userId, productId, productName }) {
            try {
                const me = await botInstance.getMe();
                const username = me?.username || 'VendraSubBot';
                const productUrl = `https://t.me/${username}?start=product_${encodeURIComponent(String(productId))}`;
                const masked = maskTelegramId(userId);
                await botInstance.sendMessage(
                    PURCHASE_LOG_GROUP_ID,
                    `User ${masked} (tg id: ${masked}) bought ${escapeHtml(productName)}.`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [[{ text: 'View Product', url: productUrl }]]
                        }
                    }
                );
                console.log(`Purchase logged to group: ${masked} -> ${productName}`);
                return true;
            } catch (err) {
                console.error('Failed to log purchase to group:', err?.response?.body || err?.message || err);
                return false;
            }
        }
        // Helper to fetch live products from Qamify with formula-calculated ETB pricing and local admin overrides
        async function getProducts() {
            const liveItems = await (0, qamify_1.fetchLiveQamifyProducts)();
            const localItems = (0, store_1.getProductsList)();
            if (liveItems && liveItems.length > 0) {
                return liveItems.map(liveProd => {
                    const override = localItems.find(loc => String(loc.id) === String(liveProd.id));
                    if (override) {
                        return {
                            ...liveProd,
                            ...override,
                            priceUSD: override.priceUSD !== undefined ? override.priceUSD : liveProd.priceUSD,
                            price: override.priceUSD !== undefined ? (0, pricing_1.calculateETBPrice)(override.priceUSD) : liveProd.price,
                            // Qamify is the source of truth for live stock.
                            // Local overrides may change pricing/details, but must never
                            // overwrite the live supplier stock.
                            stock: liveProd.stock
                        };
                    }
                    return liveProd;
                });
            }
            return localItems;
        }
        function getMainMenuKeyboard() {
            const rows = [
                [
                    { text: 'Profile', callback_data: 'btn_profile' },
                    { text: 'Shop', callback_data: 'btn_products_1' }
                ],
                [
                    { text: 'Wallet', callback_data: 'btn_wallet' },
                    { text: 'Orders', callback_data: 'btn_orders' }
                ],
                [
                    { text: 'Support', callback_data: 'btn_support' }
                ]
            ];
            return { reply_markup: { inline_keyboard: rows } };
        }
        // Format 10 products per page with NO text list in message body (buttons only)
        function formatProductListPage(products, page = 1, isAdmin = false) {
            const limit = 10;
            const totalPages = Math.ceil(products.length / limit) || 1;
            const currentPage = Math.max(1, Math.min(page, totalPages));
            const start = (currentPage - 1) * limit;
            const end = start + limit;
            const currentProducts = products.slice(start, end);
            const text = `<b>Vendra Sub Catalog (Page ${currentPage}/${totalPages})</b>\n\nSelect a product below to view details or buy:`;
            const keyboard = [];
            // Arrange all product buttons 1 per row downwards with Telegram native style colors
            currentProducts.forEach((p) => {
                const isOutOfStock = p.stock !== undefined && p.stock !== null && p.stock <= 0;
                const stockCount = p.stock !== undefined && p.stock !== null ? p.stock : '∞';
                const btnPrice = `${p.price} ETB`;
                const btnText = `${p.name} | ${btnPrice} | 📦 ${stockCount}`;
                keyboard.push([
                    {
                        text: btnText,
                        callback_data: `prod_view_${p.id}`,
                        style: isOutOfStock ? 'danger' : 'success'
                    }
                ]);
            });
            const navRow = [];
            if (currentPage > 1) {
                navRow.push({ text: '« Prev', callback_data: `page_prod_${currentPage - 1}` });
            }
            navRow.push({ text: 'Refresh Stock', callback_data: `refresh_shop_${currentPage}` });
            navRow.push({ text: '🔍 Search', callback_data: 'btn_search_products' });
            if (currentPage < totalPages) {
                navRow.push({ text: 'Next »', callback_data: `page_prod_${currentPage + 1}` });
            }
            keyboard.push(navRow);
            keyboard.push([{ text: 'Main Menu', callback_data: 'btn_main_menu' }]);
            return { text, keyboard };
        }
        // Helper: Generate Bot Admin Dashboard Screen
        function getAdminDashboardText() {
            const orders = (0, store_1.getAllOrders)();
            const users = (0, store_1.getAllUsers)();
            const products = (0, store_1.getProductsList)();
            const usedTxns = (0, store_1.getUsedTransactions)();
            const totalRev = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalPrice || 0), 0);
            const bannedCount = users.filter(u => u.isBanned).length;
            let text = `👑 <b>Vendra Sub Admin Control Panel</b>\n\n`;
            text += `• Total Completed Revenue: <b>${totalRev.toFixed(2)} ETB</b>\n`;
            text += `• Total Orders: <b>${orders.length}</b>\n`;
            text += `• Registered Users: <b>${users.length}</b> (${bannedCount} Banned)\n`;
            text += `• Active Products: <b>${products.length}</b>\n`;
            text += `• Verified Txns: <b>${usedTxns.length}</b>\n\n`;
            text += `<b>Pricing Engine:</b> <code>(USD + 0.45) * 190</code>\n`;
            text += `<b>Max Txn Age:</b> <code>15 Minutes</code>\n`;
            text += `<b>Anti-Replay Ledger:</b> <code>Active</code>\n\n`;
            text += `Select a control tool below:`;
            const keyboard = [
                [
                    { text: '👥 Manage Users & Ban', callback_data: 'admin_users_1' },
                    { text: '📦 Manage Products & Stock', callback_data: 'admin_products' }
                ],
                [
                    { text: '🎟️ Promo Codes Generator', callback_data: 'admin_promos_list' },
                    { text: '📢 Broadcast Announcement', callback_data: 'admin_broadcast_prompt' }
                ],
                [
                    { text: '🧾 Orders Log', callback_data: 'admin_orders_list' },
                    { text: '💰 Adjust User Balance', callback_data: 'admin_adjust_balance_prompt' }
                ],
                [
                    { text: '🛡️ Txns Ledger', callback_data: 'admin_txns_list' }
                ],
                [{ text: '« Exit to Store Menu', callback_data: 'btn_main_menu' }]
            ];
            return { text, keyboard };
        }
        // Command: /start
        bot.onText(/\/start(.*)/, async (msg, match) => {
            await (0, store_1.awaitHydration)();
            const chatId = msg.chat.id;
            // The purchase-log group is log-only: never run customer/admin bot flows there.
            if (chatId === PURCHASE_LOG_GROUP_ID) return;
            delete userStates[chatId];
            if (checkUserBanned(chatId))
                return;
            const membership = await checkRequiredMembership(chatId);
            if (!membership.ok) {
                await sendJoinRequired(chatId, membership);
                return;
            }
            const user = (0, store_1.getUser)(`tg_${chatId}`);
            user.username = msg.from?.username || msg.from?.first_name || `User_${chatId}`;
            // Check for referral start parameter
            const param = match && match[1] ? match[1].trim() : '';
            if (param.startsWith('ref_')) {
                const refCode = param.replace('ref_', '');
                if (!user.referredBy && refCode !== user.referralCode) {
                    user.referredBy = refCode;
                    console.log(`User ${chatId} referred by ${refCode}`);
                }
            }
            if (param.startsWith('product_')) {
                const productId = param.replace('product_', '');
                const products = await getProducts();
                const product = products.find(p => String(p.id) === String(productId));
                if (product) {
                    const keyboard = [];
                    if (user.balance >= product.price) keyboard.push([{ text: `Wallet Pay (${product.price} ETB)`, callback_data: `buy_wallet_${product.id}` }]);
                    keyboard.push([{ text: `Telebirr (${product.price} ETB)`, callback_data: `payg_init_${product.id}_telebirr` }, { text: `CBE (${product.price} ETB)`, callback_data: `payg_init_${product.id}_cbe` }]);
                    keyboard.push([{ text: 'Deposit', callback_data: 'btn_wallet_deposit' }]);
                    keyboard.push([{ text: 'Shop Catalog', callback_data: 'btn_products_1' }]);
                    let productText = `<b>${escapeHtml(product.name)}</b>\n\n`;
                    if (product.description) productText += `<b>Description:</b>\n${escapeHtml(product.description)}\n\n`;
                    productText += `• Price: <b>${product.price} ETB</b>\n• Category: <b>${escapeHtml(product.category || 'General')}</b>\n• Stock: <b>${product.stock ?? 'Unlimited'}</b>\n• Delivery: <b>Instant Automated</b>\n\nSelect a payment method:`;
                    await safeSendMessage(chatId, productText, { reply_markup: { inline_keyboard: keyboard } });
                    return;
                }
            }
            const welcomeText = `<b>Welcome to Vendra Sub, ${escapeHtml(msg.from?.first_name || 'Customer')}!</b>\n\n` +
                `Instant automated delivery of premium digital goods, vouchers & top-ups.\n` +
                `Live automated verification for Telebirr & CBE payments.\n\n` +
                `<b>Your Wallet Balance:</b> <code>${user.balance.toFixed(2)} ETB</code>\n\n` +
                `Select an option from the menu below:`;
            await safeSendMessage(chatId, welcomeText, getMainMenuKeyboard());
        });
        // Quick command menu + handlers. Configure BOTH command scopes and the
        // default chat menu button. Telegram clients use the command scope that
        // applies to the current private chat, so setting only the default scope
        // can leave the Menu list empty when an older/custom scope exists.
        const QUICK_COMMANDS = [
            { command: 'start', description: 'Open the home menu' },
            { command: 'shop', description: 'Browse the shop' },
            { command: 'wallet', description: 'View your wallet & balance' },
            { command: 'orders', description: 'View your orders' },
            { command: 'profile', description: 'View your profile' },
            { command: 'support', description: 'Contact support' }
        ];

        async function configureCommandMenu() {
            try {
                // Default scope.
                await bot.setMyCommands(QUICK_COMMANDS);
                // Explicit private-chat scope. This is the scope used by the bot
                // for users in private conversations.
                await bot.setMyCommands(QUICK_COMMANDS, {
                    scope: { type: 'all_private_chats' }
                });
                // Tell Telegram that the chat's Menu button should open commands.
                await bot.setChatMenuButton({
                    menu_button: { type: 'commands' }
                });
                console.log('Telegram command menu configured successfully.');
            } catch (err) {
                console.error('Failed to configure Telegram command menu:', err?.response?.body || err?.message || err);
            }
        }

        // Configure immediately and retry once after startup/webhook registration.
        configureCommandMenu();

        async function runQuickCommand(msg, callbackData) {
            const chatId = msg.chat.id;
            if (chatId === PURCHASE_LOG_GROUP_ID) return;
            const fakeQuery = {
                id: `quick_${msg.message_id}_${Date.now()}`,
                from: msg.from,
                chat_instance: String(chatId),
                data: callbackData,
                message: msg
            };
            bot.emit('callback_query', fakeQuery);
        }

        bot.onText(/\/shop(?:@\w+)?$/, msg => runQuickCommand(msg, 'btn_products_1'));
        bot.onText(/\/wallet(?:@\w+)?$/, msg => runQuickCommand(msg, 'btn_wallet'));
        bot.onText(/\/orders(?:@\w+)?$/, msg => runQuickCommand(msg, 'btn_orders'));
        bot.onText(/\/profile(?:@\w+)?$/, msg => runQuickCommand(msg, 'btn_profile'));
        bot.onText(/\/support(?:@\w+)?$/, msg => runQuickCommand(msg, 'btn_support'));

        // Command: /admin
        bot.onText(/\/admin/, async (msg) => {
            await (0, store_1.awaitHydration)();
            const chatId = msg.chat.id;
            // Keep the purchase-log group strictly log-only.
            if (chatId === PURCHASE_LOG_GROUP_ID) return;
            if (checkUserBanned(chatId))
                return;
            if (!isAdminTgUser(chatId)) {
                await safeSendMessage(chatId, `⛔ <b>Access Denied</b>\n\nAdmin Control Panel access is restricted exclusively to authorized administrators.`);
                return;
            }
            const { text, keyboard } = getAdminDashboardText();
            await safeSendMessage(chatId, text, {
                reply_markup: { inline_keyboard: keyboard }
            });
        });
        // Handle Callback Queries
        bot.on('callback_query', async (query) => {
            await (0, store_1.awaitHydration)();
            if (!query.message || !query.data)
                return;
            const chatId = query.message.chat.id;
            // Never process interactive bot callbacks inside the purchase-log group.
            if (chatId === PURCHASE_LOG_GROUP_ID) {
                bot.answerCallbackQuery(query.id).catch(() => {});
                return;
            }
            const fromId = query.from?.id || chatId;
            const messageId = query.message.message_id;
            const data = query.data;
            const userId = `tg_${fromId}`;

            // Membership verification is enforced on every callback interaction.
            // The membership-check button itself must remain usable while blocked.
            if (data === 'check_membership') {
                const membership = await checkRequiredMembership(fromId);
                if (membership.ok) {
                    await bot.answerCallbackQuery(query.id, { text: 'Membership verified.' }).catch(() => { });
                    await safeSendMessage(chatId, '<b>Membership verified.</b> You can now use Vendra Sub.', getMainMenuKeyboard());
                } else {
                    await bot.answerCallbackQuery(query.id, { text: 'You must join both chats first.', show_alert: true }).catch(() => { });
                    await sendJoinRequired(chatId, membership);
                }
                return;
            }
            if (!isAdminTgUser(fromId)) {
                const membership = await checkRequiredMembership(fromId);
                if (!membership.ok) {
                    await bot.answerCallbackQuery(query.id, { text: 'Join the required group and channel first.', show_alert: true }).catch(() => { });
                    await sendJoinRequired(chatId, membership);
                    return;
                }
            }

            // Check ban status on all non-admin interactions
            if (!data.startsWith('admin_') && !data.startsWith('bot_admin_')) {
                if (checkUserBanned(fromId) || checkUserBanned(chatId)) {
                    bot.answerCallbackQuery(query.id).catch(() => { });
                    return;
                }
            }
            else {
                // Enforce admin permission for TG IDs 8453713398 and 7274301492
                if (!isAdminTgUser(fromId)) {
                    bot.answerCallbackQuery(query.id, { text: '⛔ Access Denied: Admin privileges required.', show_alert: true }).catch(() => { });
                    return;
                }
            }
            const user = (0, store_1.getUser)(userId);
            if (query.from?.username)
                user.username = query.from.username;
            // Answer callback query to stop loading spinner on buttons
            bot.answerCallbackQuery(query.id).catch(() => { });
            try {
                // ==========================================
                // 👑 IN-BOT ADMIN PANEL CALLBACK HANDLERS
                // ==========================================
                if (data === 'bot_admin_menu' || data === 'admin_dashboard') {
                    delete userStates[chatId];
                    const { text, keyboard } = getAdminDashboardText();
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                // Admin: Users List (Paginated) with Ban/Unban buttons
                else if (data.startsWith('admin_users_')) {
                    delete userStates[chatId];
                    const page = parseInt(data.replace('admin_users_', ''), 10) || 1;
                    const allUsers = (0, store_1.getAllUsers)();
                    const limit = 5;
                    const totalPages = Math.ceil(allUsers.length / limit) || 1;
                    const curPage = Math.max(1, Math.min(page, totalPages));
                    const start = (curPage - 1) * limit;
                    const pagedUsers = allUsers.slice(start, start + limit);
                    let text = `👥 <b>Admin: User Management (Page ${curPage}/${totalPages})</b>\n\n`;
                    text += `Total registered accounts: <b>${allUsers.length}</b>\n\n`;
                    const keyboard = [];
                    pagedUsers.forEach((u, i) => {
                        const num = start + i + 1;
                        const banTag = u.isBanned ? '⛔ [BANNED]' : '✅ [Active]';
                        text += `<b>${num}. ${escapeHtml(u.username)}</b> ${banTag}\n`;
                        text += `   ID: <code>${escapeHtml(u.userId)}</code>\n`;
                        text += `   Balance: <code>${u.balance.toFixed(2)} ETB</code> | Spent: <code>${u.totalSpent.toFixed(2)} ETB</code>\n`;
                        if (u.isBanned && u.banReason) {
                            text += `   <i>Ban Reason: ${escapeHtml(u.banReason)}</i>\n`;
                        }
                        text += `\n`;
                        // Action buttons for each user
                        const banButtonText = u.isBanned ? `🟢 Unban ${u.username.slice(0, 8)}` : `🔴 Ban ${u.username.slice(0, 8)}`;
                        keyboard.push([
                            { text: banButtonText, callback_data: `admin_toggle_ban_${u.userId}` },
                            { text: `💰 +Balance`, callback_data: `admin_add_bal_${u.userId}` }
                        ]);
                    });
                    const navRow = [];
                    if (curPage > 1) {
                        navRow.push({ text: '« Prev', callback_data: `admin_users_${curPage - 1}` });
                    }
                    navRow.push({ text: '🔍 Find User', callback_data: 'admin_find_user_prompt' });
                    if (curPage < totalPages) {
                        navRow.push({ text: 'Next »', callback_data: `admin_users_${curPage + 1}` });
                    }
                    keyboard.push(navRow);
                    keyboard.push([{ text: '« Back to Admin Dashboard', callback_data: 'admin_dashboard' }]);
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                // Admin: Toggle Ban / Unban for a User
                else if (data.startsWith('admin_toggle_ban_')) {
                    const targetUserId = data.replace('admin_toggle_ban_', '');
                    const targetUser = (0, store_1.getUser)(targetUserId);
                    const newBanState = !targetUser.isBanned;
                    (0, store_1.setUserBanStatus)(targetUserId, newBanState, newBanState ? 'Banned by admin via Bot Dashboard' : undefined);
                    // If banned, send notice to target if on Telegram
                    if (targetUserId.startsWith('tg_')) {
                        const targetChatId = Number(targetUserId.replace('tg_', ''));
                        if (!isNaN(targetChatId)) {
                            if (newBanState) {
                                safeSendMessage(targetChatId, `⛔ <b>Notice:</b> Your account has been restricted by an administrator.`);
                            }
                            else {
                                safeSendMessage(targetChatId, `🟢 <b>Good news:</b> Your account restriction has been lifted by the administrator. Welcome back!`);
                            }
                        }
                    }
                    const actionLabel = newBanState ? '⛔ BANNED' : '🟢 UNBANNED';
                    await safeSendMessage(chatId, `User <b>${escapeHtml(targetUser.username)}</b> (<code>${escapeHtml(targetUser.userId)}</code>) is now <b>${actionLabel}</b>.`);
                    // Return to user list
                    const { text, keyboard } = getAdminDashboardText();
                    await safeSendMessage(chatId, text, { reply_markup: { inline_keyboard: keyboard } });
                }
                // Admin: Main Adjust Balance Picker
                else if (data === 'admin_adjust_balance_prompt') {
                    delete userStates[chatId];
                    const allUsers = (0, store_1.getAllUsers)();
                    let text = `💰 <b>Admin: Adjust User Balance</b>\n\n`;
                    text += `Select a customer below to adjust their wallet balance, or use 🔍 <b>Find User</b> to search by username/ID:\n\n`;
                    const keyboard = [];
                    allUsers.slice(0, 6).forEach((u) => {
                        text += `• <b>${escapeHtml(u.username)}</b> (<code>${escapeHtml(u.userId)}</code>): <code>${u.balance.toFixed(2)} ETB</code>\n`;
                        keyboard.push([
                            { text: `💰 Adjust ${u.username.slice(0, 16)} (${u.balance} ETB)`, callback_data: `admin_add_bal_${u.userId}` }
                        ]);
                    });
                    keyboard.push([
                        { text: '🔍 Find Specific User', callback_data: 'admin_find_user_prompt' },
                        { text: '👥 All Users', callback_data: 'admin_users_1' }
                    ]);
                    keyboard.push([{ text: '« Back to Admin Dashboard', callback_data: 'admin_dashboard' }]);
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                // Admin: Quick Preset Balance Adjustment Execution
                else if (data.startsWith('admin_quick_adj_')) {
                    const parts = data.replace('admin_quick_adj_', '').split('_');
                    const delta = parseFloat(parts.pop() || '0');
                    const targetUserId = parts.join('_');
                    delete userStates[chatId];
                    if (isNaN(delta) || !targetUserId) {
                        safeSendMessage(chatId, '❌ Invalid adjustment parameters.');
                        return;
                    }
                    const updated = (0, store_1.adjustUserBalanceAdmin)(targetUserId, delta, 'Admin 1-click adjustment via Bot');
                    // Notify admin
                    let resText = `✅ <b>Balance Adjusted Successfully!</b>\n\n`;
                    resText += `• User: <b>${escapeHtml(updated.username)}</b> (<code>${escapeHtml(updated.userId)}</code>)\n`;
                    resText += `• Adjustment: <b>${delta > 0 ? `+${delta}` : delta} ETB</b>\n`;
                    resText += `• New Wallet Balance: <b>${updated.balance.toFixed(2)} ETB</b>\n\n`;
                    resText += `Select another action below:`;
                    const keyboard = [
                        [
                            { text: `💰 Adjust ${updated.username.slice(0, 10)} Again`, callback_data: `admin_add_bal_${updated.userId}` },
                            { text: '👥 User List', callback_data: 'admin_users_1' }
                        ],
                        [{ text: '« Back to Admin Dashboard', callback_data: 'admin_dashboard' }]
                    ];
                    await safeSendMessage(chatId, resText, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                    // Notify target if on Telegram
                    if (targetUserId.startsWith('tg_')) {
                        const targetChatId = Number(targetUserId.replace('tg_', ''));
                        if (!isNaN(targetChatId)) {
                            safeSendMessage(targetChatId, `💰 <b>Wallet Update:</b> An administrator credited/adjusted your wallet balance by <b>${delta > 0 ? `+${delta}` : delta} ETB</b>.\nYour current balance is <code>${updated.balance.toFixed(2)} ETB</code>.`);
                        }
                    }
                }
                // Admin: Prompt for Balance Adjustment for a Specific User
                else if (data.startsWith('admin_add_bal_')) {
                    const targetUserId = data.replace('admin_add_bal_', '');
                    const targetUser = (0, store_1.getUser)(targetUserId);
                    let text = `💰 <b>Adjust Wallet Balance</b>\n\n`;
                    text += `Target Customer: <b>${escapeHtml(targetUser.username)}</b>\n`;
                    text += `User ID: <code>${escapeHtml(targetUser.userId)}</code>\n`;
                    text += `Current Balance: <code>${targetUser.balance.toFixed(2)} ETB</code>\n\n`;
                    text += `• Tap a <b>quick preset button</b> below for 1-click credit/deduction.\n`;
                    text += `• OR <b>reply directly to this message</b> with any custom number (e.g. <code>+350</code>, <code>500</code>, or <code>-75</code>):`;
                    const keyboard = [
                        [
                            { text: '+50 ETB', callback_data: `admin_quick_adj_${targetUserId}_50` },
                            { text: '+100 ETB', callback_data: `admin_quick_adj_${targetUserId}_100` },
                            { text: '+250 ETB', callback_data: `admin_quick_adj_${targetUserId}_250` }
                        ],
                        [
                            { text: '+500 ETB', callback_data: `admin_quick_adj_${targetUserId}_500` },
                            { text: '+1000 ETB', callback_data: `admin_quick_adj_${targetUserId}_1000` },
                            { text: '-100 ETB', callback_data: `admin_quick_adj_${targetUserId}_-100` }
                        ],
                        [
                            { text: '« Cancel to Users', callback_data: 'admin_users_1' }
                        ]
                    ];
                    const sent = await safeSendMessage(chatId, text, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: keyboard
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'ADMIN_ADJUST_BALANCE',
                            data: { targetUserId, promptMsgId: sent.message_id }
                        };
                    }
                }
                // Admin: Search / Find User Prompt
                else if (data === 'admin_find_user_prompt') {
                    const sent = await safeSendMessage(chatId, `🔍 <b>Find User to Manage</b>\n\nPlease reply with the user's username or Telegram ID (e.g. <code>tg_12345678</code> or <code>john_doe</code>):`, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'admin_users_1' }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'ADMIN_FIND_USER',
                            data: { promptMsgId: sent.message_id }
                        };
                    }
                }
                // Admin: Broadcast Prompt
                else if (data === 'admin_broadcast_prompt') {
                    const sent = await safeSendMessage(chatId, `📢 <b>Broadcast Announcement to ALL Bot Users</b>\n\n` +
                        `Please reply with any message to broadcast: text, photo, video, document, audio, voice, GIF, sticker, etc.\n\n` +
                        `<i>Tip: Send /cancel to abort.</i>`, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'admin_dashboard' }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'ADMIN_BROADCAST',
                            data: { promptMsgId: sent.message_id }
                        };
                    }
                }
                // Admin: Products List Overview & Interactive Management
                else if (data === 'admin_products' || data.startsWith('admin_prods_p_')) {
                    delete userStates[chatId];
                    const prods = await getProducts();
                    let text = `📦 <b>Admin: Manage Products & Pricing (${prods.length} Total)</b>\n\n`;
                    text += `Select a product below to adjust its <b>Price (USD/ETB)</b>, <b>Stock</b>, or delete it:\n\n`;
                    const keyboard = [];
                    prods.forEach((p, idx) => {
                        text += `${idx + 1}. <b>${escapeHtml(p.name)}</b>\n`;
                        text += `   • Price: <b>${p.price} ETB</b> ($${p.priceUSD?.toFixed(2)} USD) | Stock: <b>${p.stock !== undefined ? p.stock : 'Unlimited'}</b>\n`;
                        text += `   • Formula: <code>(${p.priceUSD} + 0.45) * 190 = ${p.price} ETB</code>\n\n`;
                        keyboard.push([
                            { text: `✏️ Edit: ${p.name.slice(0, 22)}`, callback_data: `admin_edit_prod_${p.id}` }
                        ]);
                    });
                    keyboard.push([
                        { text: '➕ Add New Product', callback_data: 'admin_add_product_prompt' },
                        { text: '« Admin Dashboard', callback_data: 'admin_dashboard' }
                    ]);
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                // Admin: Edit Specific Product Details & Actions
                else if (data.startsWith('admin_edit_prod_')) {
                    delete userStates[chatId];
                    const prodId = data.replace('admin_edit_prod_', '');
                    const prods = await getProducts();
                    const prod = prods.find(p => String(p.id) === String(prodId));
                    if (!prod) {
                        safeSendMessage(chatId, '❌ Product not found.');
                        return;
                    }
                    let text = `📦 <b>Manage Product: ${escapeHtml(prod.name)}</b>\n\n`;
                    text += `• Category: <b>${escapeHtml(prod.category || 'General')}</b>\n`;
                    text += `• Price: <b>${prod.price} ETB</b> ($${prod.priceUSD?.toFixed(2)} USD)\n`;
                    text += `• Current Stock: <b>${prod.stock !== undefined ? prod.stock : 'Unlimited'}</b>\n`;
                    text += `• Delivery Type: <code>${escapeHtml(prod.deliveryType)}</code>\n`;
                    if (prod.description)
                        text += `• Description: <i>${escapeHtml(prod.description)}</i>\n\n`;
                    text += `Choose an action:`;
                    const keyboard = [
                        [
                            { text: '💵 Set USD Price', callback_data: `admin_prod_set_price_${prod.id}` },
                            { text: '📊 Set Stock', callback_data: `admin_prod_set_stock_${prod.id}` }
                        ],
                        [
                            { text: '➕ +10 Stock', callback_data: `admin_prod_quick_stock_${prod.id}_10` },
                            { text: '➕ +50 Stock', callback_data: `admin_prod_quick_stock_${prod.id}_50` },
                            { text: '♾️ Unlimited', callback_data: `admin_prod_quick_stock_${prod.id}_9999` }
                        ],
                        [
                            { text: '🗑️ Delete Product', callback_data: `admin_prod_delete_${prod.id}` },
                            { text: '« Products List', callback_data: 'admin_products' }
                        ]
                    ];
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                // Admin: Quick Stock Preset Adjustment
                else if (data.startsWith('admin_prod_quick_stock_')) {
                    const parts = data.replace('admin_prod_quick_stock_', '').split('_');
                    const stockDelta = parseInt(parts.pop() || '0', 10);
                    const prodId = parts.join('_');
                    const prods = await getProducts();
                    const prod = prods.find(p => String(p.id) === String(prodId));
                    if (prod) {
                        const newStock = stockDelta === 9999 ? 9999 : Math.max(0, (prod.stock || 0) + stockDelta);
                        (0, store_1.updateProduct)(prod.id, { stock: newStock }, prod);
                        safeSendMessage(chatId, `✅ Updated stock for <b>${escapeHtml(prod.name)}</b> to <b>${newStock >= 9999 ? 'Unlimited' : newStock}</b>!`, {
                            reply_markup: {
                                inline_keyboard: [[{ text: '« Back to Product', callback_data: `admin_edit_prod_${prod.id}` }]]
                            }
                        });
                    }
                }
                // Admin: Delete Product Callback
                else if (data.startsWith('admin_prod_delete_')) {
                    const prodId = data.replace('admin_prod_delete_', '');
                    const prods = await getProducts();
                    const prod = prods.find(p => String(p.id) === String(prodId));
                    if (prod) {
                        (0, store_1.deleteProduct)(prod.id);
                        safeSendMessage(chatId, `🗑️ Deleted product: <b>${escapeHtml(prod.name)}</b>.`, {
                            reply_markup: {
                                inline_keyboard: [[{ text: '« Products Catalog', callback_data: 'admin_products' }]]
                            }
                        });
                    }
                }
                // Admin: Prompt Set Product Price
                else if (data.startsWith('admin_prod_set_price_')) {
                    const prodId = data.replace('admin_prod_set_price_', '');
                    const prods = await getProducts();
                    const prod = prods.find(p => String(p.id) === String(prodId));
                    if (prod) {
                        const sent = await safeSendMessage(chatId, `💵 <b>Set USD Base Price for ${escapeHtml(prod.name)}</b>\n\n` +
                            `Current USD Price: <code>$${prod.priceUSD?.toFixed(2)} USD</code> (${prod.price} ETB)\n` +
                            `Formula automatically computes: <code>(USD + 0.45) * 190 ETB</code>\n\n` +
                            `Please reply with the new USD price (e.g. <code>4.50</code>, <code>12.00</code>, or <code>2.99</code>):`, {
                            reply_markup: {
                                force_reply: true,
                                inline_keyboard: [[{ text: 'Cancel', callback_data: `admin_edit_prod_${prod.id}` }]]
                            }
                        });
                        if (sent) {
                            userStates[chatId] = {
                                action: 'ADMIN_SET_PRODUCT_PRICE',
                                data: { prodId: prod.id, promptMsgId: sent.message_id }
                            };
                        }
                    }
                }
                // Admin: Prompt Set Product Stock
                else if (data.startsWith('admin_prod_set_stock_')) {
                    const prodId = data.replace('admin_prod_set_stock_', '');
                    const prods = await getProducts();
                    const prod = prods.find(p => String(p.id) === String(prodId));
                    if (prod) {
                        const sent = await safeSendMessage(chatId, `📊 <b>Set Stock Quantity for ${escapeHtml(prod.name)}</b>\n\n` +
                            `Current Stock: <code>${prod.stock !== undefined ? prod.stock : 'Unlimited'}</code>\n\n` +
                            `Please reply with the new stock number (e.g. <code>50</code>, <code>100</code>, or <code>0</code>):`, {
                            reply_markup: {
                                force_reply: true,
                                inline_keyboard: [[{ text: 'Cancel', callback_data: `admin_edit_prod_${prod.id}` }]]
                            }
                        });
                        if (sent) {
                            userStates[chatId] = {
                                action: 'ADMIN_SET_PRODUCT_STOCK',
                                data: { prodId: prod.id, promptMsgId: sent.message_id }
                            };
                        }
                    }
                }
                // Admin: Prompt Add New Product
                else if (data === 'admin_add_product_prompt') {
                    const sent = await safeSendMessage(chatId, `➕ <b>Add New Product to Store Catalog</b>\n\n` +
                        `Please reply with product details in this format:\n` +
                        `<code>Name | USD_Price | Category | Stock | Description</code>\n\n` +
                        `Example:\n` +
                        `<code>Netflix 4K UHD (1 Month) | 4.50 | Streaming | 50 | Ultra HD 4K Private Profile</code>\n\n` +
                        `<i>Tip: ETB price will be computed automatically!</i>`, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'admin_products' }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'ADMIN_ADD_PRODUCT',
                            data: { promptMsgId: sent.message_id }
                        };
                    }
                }
                // Admin: Promo Codes List & Generator in Bot
                else if (data === 'admin_promos_list') {
                    delete userStates[chatId];
                    const promos = (0, store_1.getAllPromoCodes)();
                    let text = `🎟️ <b>Admin: Promo Codes Manager (${Object.keys(promos).length} Active)</b>\n\n`;
                    const keyboard = [];
                    if (Object.keys(promos).length === 0) {
                        text += `No promo codes active in database yet.`;
                    }
                    else {
                        Object.entries(promos).forEach(([code, details]) => {
                            text += `• <b>${escapeHtml(code)}</b>: <code>+${details.reward} ETB</code> (Used: ${details.currentUses}/${details.maxUses})\n`;
                            keyboard.push([
                                { text: `🗑️ Delete ${code} (+${details.reward} ETB)`, callback_data: `admin_delete_promo_${code}` }
                            ]);
                        });
                    }
                    keyboard.push([
                        { text: '➕ Create New Promo Code', callback_data: 'admin_create_promo_prompt' }
                    ]);
                    keyboard.push([
                        { text: '« Back to Admin Dashboard', callback_data: 'admin_dashboard' }
                    ]);
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                // Admin: Create Promo Code Prompt in Bot
                else if (data === 'admin_create_promo_prompt') {
                    const sent = await safeSendMessage(chatId, `🎟️ <b>Create New Promo Code</b>\n\n` +
                        `Please reply with promo details in format:\n` +
                        `<code>CODE | REWARD_ETB | MAX_USES</code>\n\n` +
                        `Example:\n` +
                        `<code>FLASH100 | 100 | 500</code>\n` +
                        `<code>SUMMER50 | 50 | 1000</code>`, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'admin_promos_list' }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'ADMIN_CREATE_PROMO',
                            data: { promptMsgId: sent.message_id }
                        };
                    }
                }
                // Admin: Delete Promo Code in Bot
                else if (data.startsWith('admin_delete_promo_')) {
                    const codeToDelete = data.replace('admin_delete_promo_', '');
                    (0, store_1.deletePromoCode)(codeToDelete);
                    safeSendMessage(chatId, `🗑️ Promo code <b>${escapeHtml(codeToDelete)}</b> deleted!`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Promo Codes List', callback_data: 'admin_promos_list' }]]
                        }
                    });
                }
                // Admin: Orders Log
                else if (data === 'admin_orders_list') {
                    const orders = (0, store_1.getAllOrders)();
                    let text = `🧾 <b>Admin: Recent Orders Log (${orders.length} Total)</b>\n\n`;
                    if (orders.length === 0) {
                        text += `No orders in database yet.`;
                    }
                    else {
                        orders.slice(0, 6).forEach((o, i) => {
                            text += `${i + 1}. <code>${escapeHtml(o.id)}</code> • <b>${escapeHtml(o.productName)}</b>\n`;
                            text += `   User: <code>${escapeHtml(o.userId)}</code> | ${o.totalPrice} ETB [${escapeHtml(o.status.toUpperCase())}]\n`;
                            if (o.transactionRef)
                                text += `   Txn Ref: <code>${escapeHtml(o.transactionRef)}</code>\n`;
                            if (o.licenseKey)
                                text += `   Key: <code>${escapeHtml(o.licenseKey)}</code>\n`;
                            text += `\n`;
                        });
                    }
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '« Back to Admin Dashboard', callback_data: 'admin_dashboard' }]
                            ]
                        }
                    });
                }
                // Admin: Verified Transactions Anti-Replay List
                else if (data === 'admin_txns_list') {
                    const txns = (0, store_1.getUsedTransactions)();
                    let text = `🛡️ <b>Admin: Anti-Replay Ledger (${txns.length} Txns)</b>\n\n`;
                    if (txns.length === 0) {
                        text += `No transactions logged yet.`;
                    }
                    else {
                        txns.slice(0, 8).forEach((t, idx) => {
                            const timeStr = new Date(t.usedAt || t.txTimestamp || 0).toLocaleTimeString();
                            text += `${idx + 1}. <code>${escapeHtml(t.transactionId)}</code> • <b>${t.amount} ETB</b> (${escapeHtml(t.method.toUpperCase())})\n`;
                            text += `   User: <code>${escapeHtml(t.userId)}</code> | ${timeStr}\n\n`;
                        });
                    }
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '« Back to Admin Dashboard', callback_data: 'admin_dashboard' }]
                            ]
                        }
                    });
                }
                // ==========================================
                // STANDARD STORE CALLBACK HANDLERS
                // ==========================================
                // 1. Back to Main Menu
                else if (data === 'btn_main_menu') {
                    delete userStates[chatId];
                    const menuText = `<b>Main Menu</b>\n\n` +
                        `Account: <b>${escapeHtml(user.username)}</b>\n` +
                        `Balance: <code>${user.balance.toFixed(2)} ETB</code>\n\n` +
                        `Select a section:`;
                    await safeEditMessage(chatId, messageId, menuText, getMainMenuKeyboard());
                }
                // 2. Refresh Shop Stock
                // Every refresh performs a fresh GET request to Qamify /v1/products.
                // The returned catalog is then rendered immediately, so stock changes
                // and deleted supplier products are reflected in the shop.
                else if (data.startsWith('refresh_shop_')) {
                    delete userStates[chatId];
                    const page = parseInt(data.replace('refresh_shop_', ''), 10) || 1;
                    try {
                        const liveProducts = await (0, qamify_1.fetchLiveQamifyProducts)();
                        const localItems = (0, store_1.getProductsList)();
                        let products = liveProducts;
                        if (liveProducts && liveProducts.length > 0) {
                            products = liveProducts.map(liveProd => {
                                const override = localItems.find(loc => String(loc.id) === String(liveProd.id));
                                return override ? {
                                    ...liveProd,
                                    ...override,
                                    priceUSD: override.priceUSD !== undefined ? override.priceUSD : liveProd.priceUSD,
                                    price: override.priceUSD !== undefined ? (0, pricing_1.calculateETBPrice)(override.priceUSD) : liveProd.price,
                                    stock: liveProd.stock
                                } : liveProd;
                            });
                        }
                        else {
                            products = localItems;
                        }
                        const isAdmin = isAdminTgUser(fromId);
                        const { text, keyboard } = formatProductListPage(products, page, isAdmin);
                        await safeEditMessage(chatId, messageId, text, {
                            reply_markup: { inline_keyboard: keyboard }
                        });
                    }
                    catch (err) {
                        console.error('Shop stock refresh failed:', err);
                        await safeSendMessage(chatId, 'Unable to refresh stock right now. Please try again.');
                    }
                }
                // 3. Products List
                else if (data.startsWith('btn_products_') || data.startsWith('page_prod_')) {
                    delete userStates[chatId];
                    const page = parseInt(data.replace('btn_products_', '').replace('page_prod_', ''), 10) || 1;
                    const products = await getProducts();
                    const isAdmin = isAdminTgUser(fromId);
                    const { text, keyboard } = formatProductListPage(products, page, isAdmin);
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                // 3. Search Products Button
                else if (data === 'btn_search_products') {
                    const sent = await safeSendMessage(chatId, `<b>Search Products</b>\n\nPlease reply with the product name or keyword (e.g. <code>Telegram</code>, <code>Nitro</code>, <code>PUBG</code>, <code>Spotify</code>):`, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'btn_products_1' }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'SEARCH_QUERY',
                            data: { promptMsgId: sent.message_id }
                        };
                    }
                }
                // 4. Product Details View
                else if (data.startsWith('prod_view_')) {
                    delete userStates[chatId];
                    const prodId = data.replace('prod_view_', '');
                    const products = await getProducts();
                    const product = products.find(p => String(p.id) === String(prodId));
                    if (!product) {
                        safeSendMessage(chatId, 'Product not found.', {
                            reply_markup: {
                                inline_keyboard: [[{ text: '< Catalog', callback_data: 'btn_products_1' }]]
                            }
                        });
                        return;
                    }
                    const isAdmin = isAdminTgUser(fromId);
                    let text = `<b>${escapeHtml(product.name)}</b>\n\n`;
                    if (product.description) {
                        text += `<b>Description:</b>\n${escapeHtml(product.description)}\n\n`;
                    }
                    text += `• Price: <b>${product.price} ETB</b>\n`;
                    text += `• Category: <b>${escapeHtml(product.category || 'General')}</b>\n`;
                    text += `• Stock: <b>${product.stock !== undefined && product.stock !== null ? product.stock : 'Unlimited'}</b>\n`;
                    text += `• Delivery: <b>Instant Automated</b>\n\n`;
                    text += `<b>📲 Telebirr Payment Details:</b>\n`;
                    text += `• Phone: <code>0967197797</code>\n`;
                    text += `• Name: <b>SINTAYEHU DEBELA ANGESA</b>\n\n`;
                    text += `<b>Your Balance:</b> <code>${user.balance.toFixed(2)} ETB</code>\n\n`;
                    text += `Select a payment method:`;
                    const keyboard = [];
                    if (user.balance >= product.price) {
                        keyboard.push([{ text: `Wallet Pay (${product.price} ETB)`, callback_data: `buy_wallet_${product.id}` }]);
                    }
                    // Direct Pay-As-You-Go Options
                    keyboard.push([
                        { text: `Telebirr (${product.price} ETB)`, callback_data: `payg_init_${product.id}_telebirr` },
                        { text: `CBE (${product.price} ETB)`, callback_data: `payg_init_${product.id}_cbe` }
                    ]);
                    // Deposit only; promo/gift-code redemption is available from Profile.
                    keyboard.push([{ text: 'Deposit', callback_data: 'btn_wallet_deposit' }]);
                    keyboard.push([{ text: 'Shop Catalog', callback_data: 'btn_products_1' }]);
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                // 5. Buy with Wallet Balance
                else if (data.startsWith('buy_wallet_')) {
                    const prodId = data.replace('buy_wallet_', '');
                    const products = await getProducts();
                    const product = products.find(p => String(p.id) === String(prodId));
                    if (!product) {
                        safeSendMessage(chatId, 'Product not found.');
                        return;
                    }
                    if (user.balance < product.price) {
                        safeSendMessage(chatId, `<b>Insufficient Balance</b>\n\nYou need <b>${product.price} ETB</b>, but only have <code>${user.balance.toFixed(2)} ETB</code>.\n\nPlease deposit or use Pay-As-You-Go direct transfer.`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Deposit', callback_data: 'btn_wallet_deposit' }],
                                    [{ text: 'Telebirr', callback_data: `payg_init_${product.id}_telebirr` }],
                                    [{ text: '< Product', callback_data: `prod_view_${product.id}` }]
                                ]
                            }
                        });
                        return;
                    }
                    // Deduct balance & submit supplier order to Qamify
                    (0, store_1.updateUserBalance)(userId, -product.price);
                    const qamifyRes = await (0, qamify_1.placeQamifyOrder)(product.id, 1);
                    if (!qamifyRes.success) {
                        (0, store_1.updateUserBalance)(userId, product.price); // Refund
                        await safeEditMessage(chatId, messageId, `❌ <b>Order Failed</b>\n\nSupplier system error: ${escapeHtml(qamifyRes.message || 'Out of stock')}\n\nYour <code>${product.price} ETB</code> has been refunded to your wallet.`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '« Back to Product', callback_data: `prod_view_${product.id}` }],
                                    [{ text: '💳 View Wallet', callback_data: 'btn_wallet' }],
                                    [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                                ]
                            }
                        });
                        return;
                    }
                    const order = (0, store_1.createOrder)({
                        userId,
                        userName: user.username,
                        productId: product.id,
                        productName: product.name,
                        qty: 1,
                        totalPrice: product.price,
                        originalPriceUSD: product.priceUSD,
                        paymentMethod: 'wallet',
                        status: 'completed',
                        licenseKey: qamifyRes.licenseKey,
                        verifiedAt: new Date().toISOString()
                    });
                    await logPurchaseToGroup({ userId, productId: product.id, productName: product.name });
                    let text = `<b>Order Successful!</b>\n\n`;
                    text += `Item: <b>${escapeHtml(product.name)}</b>\n`;
                    text += `Order ID: <code>${escapeHtml(order.id)}</code>\n`;
                    text += `Paid: <code>${product.price} ETB</code> (via Wallet Balance)\n`;
                    text += `Remaining Balance: <code>${user.balance.toFixed(2)} ETB</code>\n\n`;
                    text += `<b>Your License Key / Voucher:</b>\n<code>${escapeHtml(order.licenseKey || 'N/A')}</code>\n\n`;
                    text += `Thank you for choosing Vendra Sub!`;
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '📜 View Orders', callback_data: 'btn_orders' }],
                                [{ text: '🛍️ Browse Catalog', callback_data: 'btn_products_1' }],
                                [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                            ]
                        }
                    });
                }
                // 6. Pay As You Go Direct (Telebirr / CBE) Initiation
                else if (data.startsWith('payg_init_')) {
                    const parts = data.replace('payg_init_', '').split('_');
                    const method = parts.pop();
                    const prodId = parts.join('_');
                    const products = await getProducts();
                    const product = products.find(p => String(p.id) === String(prodId));
                    if (!product) {
                        safeSendMessage(chatId, 'Product not found.');
                        return;
                    }
                    const config = veritas_1.PAYMENT_CONFIG[method];
                    let text = `<b>Direct Payment via ${escapeHtml(config.name)}</b>\n\n`;
                    text += `Product: <b>${escapeHtml(product.name)}</b>\n`;
                    text += `Amount Required: <b>${product.price} ETB</b>\n\n`;
                    text += `<b>Transfer Details:</b>\n`;
                    text += `• Account / Phone: <code>${escapeHtml(config.accountNumber)}</code>\n`;
                    text += `• Receiver Name: <b>${escapeHtml(config.accountName)}</b>\n\n`;
                    text += `<b>Instructions:</b>\n`;
                    text += `1. Transfer exactly <b>${product.price} ETB</b> (or more — any extra will be automatically credited to your wallet).\n`;
                    text += `2. Copy the <b>Transaction ID</b> from your ${escapeHtml(config.name)} SMS receipt.\n`;
                    text += `3. Reply to this message with the Transaction ID (e.g. <code>TB12345678</code> or <code>FT12345678</code>).\n\n`;
                    text += `<i>Strict automated verification. Receiver name must match <b>SINTAYEHU DEBELA ANGESA</b>. Transactions older than 15 minutes are rejected.</i>`;
                    const paygNavRows = [
                        [{ text: 'Deposit', callback_data: 'btn_wallet_deposit' }],
                        [{ text: 'Cancel', callback_data: `prod_view_${product.id}` }]
                    ];
                    const sent = await safeSendMessage(chatId, text, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: paygNavRows
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'VERIFY_PAYG_ORDER',
                            data: {
                                productId: product.id,
                                productName: product.name,
                                price: product.price,
                                priceUSD: product.priceUSD,
                                method,
                                promptMsgId: sent.message_id
                            }
                        };
                    }
                }
                // Product redemption removed. Promo/gift codes are redeemed only from Profile.
                // 7. Wallet Center
                else if (data === 'btn_wallet') {
                    delete userStates[chatId];
                    let text = `<b>Vendra Sub Wallet Center</b>\n\n`;
                    text += `Current Balance: <code>${user.balance.toFixed(2)} ETB</code>\n`;
                    text += `Total Spent: <code>${user.totalSpent.toFixed(2)} ETB</code>\n\n`;
                    text += `You can deposit funds to make instant 1-click purchases anytime, or view your past top-ups.`;
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: 'Deposit', callback_data: 'btn_wallet_deposit' },
                                    { text: 'History', callback_data: 'btn_wallet_history' }
                                ],
                                [{ text: 'Redeem', callback_data: 'btn_redeem' }],
                                [{ text: 'Menu', callback_data: 'btn_main_menu' }]
                            ]
                        }
                    });
                }
                // 8. Deposit Flow
                else if (data === 'btn_wallet_deposit') {
                    delete userStates[chatId];
                    let text = `<b>Deposit to Wallet</b>\n\n`;
                    text += `<b>📲 Telebirr Payment Details:</b>\n`;
                    text += `• Phone / Account: <code>0967197797</code>\n`;
                    text += `• Receiver Name: <b>SINTAYEHU DEBELA ANGESA</b>\n\n`;
                    text += `• Instant automated payment verification\n`;
                    text += `• Instant wallet crediting upon receipt\n\n`;
                    text += `Select payment method below:`;
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Telebirr', callback_data: 'deposit_method_telebirr' }],
                                [{ text: 'CBE', callback_data: 'deposit_method_cbe' }],
                                [{ text: '< Wallet', callback_data: 'btn_wallet' }]
                            ]
                        }
                    });
                }
                // 9. Deposit Form Initiation
                else if (data.startsWith('deposit_method_')) {
                    const method = data.replace('deposit_method_', '');
                    const config = veritas_1.PAYMENT_CONFIG[method];
                    let text = `<b>Deposit via ${escapeHtml(config.name)}</b>\n\n`;
                    text += `<b>Account Details:</b>\n`;
                    text += `• Transfer To: <code>${escapeHtml(config.accountNumber)}</code>\n`;
                    text += `• Account Name: <b>${escapeHtml(config.accountName)}</b>\n\n`;
                    text += `Please reply with the <b>Amount in ETB</b> you want to deposit (minimum 10 ETB, e.g. <code>200</code>, <code>500</code>, <code>1000</code>).`;
                    const sent = await safeSendMessage(chatId, text, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'btn_wallet' }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'DEPOSIT_AMOUNT',
                            data: { method, promptMsgId: sent.message_id }
                        };
                    }
                }
                // 10. Deposit History
                else if (data === 'btn_wallet_history') {
                    const deposits = (0, store_1.getDeposits)(userId);
                    let text = `<b>Deposit History</b>\n\n`;
                    if (deposits.length === 0) {
                        text += `No deposit transactions recorded yet.`;
                    }
                    else {
                        deposits.slice(0, 8).forEach((d, i) => {
                            const date = new Date(d.createdAt).toLocaleDateString();
                            text += `${i + 1}. <b>+${d.amount} ETB</b> via ${escapeHtml(d.method.toUpperCase())}\n`;
                            text += `   Ref: <code>${escapeHtml(d.transactionRef)}</code> | ${date} [Verified]\n\n`;
                        });
                    }
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Deposit', callback_data: 'btn_wallet_deposit' }],
                                [{ text: '< Wallet', callback_data: 'btn_wallet' }]
                            ]
                        }
                    });
                }
                // 11. Profile Section
                else if (data === 'btn_profile') {
                    delete userStates[chatId];
                    let text = `<b>Your Profile</b>\n\n`;
                    text += `• User ID: <code>${escapeHtml(user.userId)}</code>\n`;
                    text += `• Username: <b>${escapeHtml(user.username)}</b>\n`;
                    text += `• Wallet Balance: <code>${user.balance.toFixed(2)} ETB</code>\n`;
                    text += `• Total Spent: <code>${user.totalSpent.toFixed(2)} ETB</code>\n`;
                    text += `• Referral Code: <code>${escapeHtml(user.referralCode)}</code>\n`;
                    text += `• Invited Friends: <b>${user.referralCount}</b>\n`;
                    text += `• Referral Earnings: <code>${user.referralEarnings.toFixed(2)} ETB</code>\n\n`;
                    text += `Share your referral link or redeem promo codes for wallet bonuses.`;
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: 'Referrals', callback_data: 'btn_referral' },
                                    { text: 'Redeem', callback_data: 'btn_redeem' }
                                ],
                                [{ text: 'Menu', callback_data: 'btn_main_menu' }]
                            ]
                        }
                    });
                }
                // 12. Profile - Referral
                else if (data === 'btn_referral') {
                    let botUsername = 'VendraSubBot';
                    try {
                        const me = await bot.getMe();
                        if (me && me.username)
                            botUsername = me.username;
                    }
                    catch { }
                    const refLink = `https://t.me/${botUsername}?start=ref_${user.referralCode}`;
                    let text = `<b>Vendra Sub Referral Program</b>\n\n`;
                    text += `Invite friends and earn <b>5% commission</b> in ETB directly to your wallet for every purchase they make!\n\n`;
                    text += `Your Referral Code: <code>${escapeHtml(user.referralCode)}</code>\n`;
                    text += `Your Referral Link:\n<code>${escapeHtml(refLink)}</code>\n\n`;
                    text += `<b>Your Stats:</b>\n`;
                    text += `• Total Friends Invited: <b>${user.referralCount}</b>\n`;
                    text += `• Total Earnings: <code>${user.referralEarnings.toFixed(2)} ETB</code>`;
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Share',
                                        url: `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('Get digital products & subscriptions on Vendra Sub!')}`
                                    }
                                ],
                                [{ text: '< Profile', callback_data: 'btn_profile' }]
                            ]
                        }
                    });
                }
                // 13. Profile - Redeem Code
                else if (data === 'btn_redeem') {
                    const sent = await safeSendMessage(chatId, `<b>Redeem Promo Code / Gift Voucher</b>\n\n` +
                        `Please reply with your promo code (e.g. <code>WELCOME50</code>, <code>VENDRA100</code>, <code>BONUS25</code>):`, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'btn_profile' }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'REDEEM_CODE',
                            data: { promptMsgId: sent.message_id }
                        };
                    }
                }
                // 14. Orders Section
                else if (data === 'btn_orders') {
                    delete userStates[chatId];
                    const orders = (0, store_1.getAllOrders)(userId);
                    let text = `<b>Orders Center</b>\n\n`;
                    text += `Total Orders: <b>${orders.length}</b>\n\n`;
                    if (orders.length > 0) {
                        text += `<b>Recent Orders:</b>\n`;
                        orders.slice(0, 4).forEach((o, idx) => {
                            text += `${idx + 1}. <code>${escapeHtml(o.id)}</code> - <b>${escapeHtml(o.productName)}</b>\n`;
                            text += `   Price: ${o.totalPrice} ETB | Status: [${escapeHtml(o.status.toUpperCase())}]\n`;
                            text += `   Key: <code>${escapeHtml(o.licenseKey || 'N/A')}</code>\n\n`;
                        });
                    }
                    else {
                        text += `You have not placed any orders yet.`;
                    }
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Check Order', callback_data: 'btn_check_order_id' }],
                                [{ text: 'Products', callback_data: 'btn_products_1' }],
                                [{ text: 'Menu', callback_data: 'btn_main_menu' }]
                            ]
                        }
                    });
                }
                // 15. Orders - Check Order by ID
                else if (data === 'btn_check_order_id') {
                    const sent = await safeSendMessage(chatId, `<b>Order Status Lookup</b>\n\nPlease reply with your <b>Order ID</b> (e.g. <code>ORD-78192</code>):`, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: 'btn_orders' }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'LOOKUP_ORDER_ID',
                            data: { promptMsgId: sent.message_id }
                        };
                    }
                }
                // 16. Support Section
                else if (data === 'btn_support') {
                    delete userStates[chatId];
                    let text = `<b>Customer Support & Help Center</b>\n\n`;
                    text += `We assist with order delivery, automated payment verification, and questions.\n\n`;
                    text += `• Automated Verification: Instant for Telebirr and CBE.\n`;
                    text += `• Support Hours: 24/7 online support team.\n`;
                    text += `• Official Telegram Support: <a href="https://t.me/VendraSubET">@VendraSubET</a>\n\n`;
                    text += `Select an option:`;
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'FAQ', callback_data: 'btn_faq' }],
                                [{ text: 'Telegram Support', url: 'https://t.me/VendraSubET' }],
                                [{ text: 'Menu', callback_data: 'btn_main_menu' }]
                            ]
                        }
                    });
                }
                // 17. FAQ
                else if (data === 'btn_faq') {
                    let text = `<b>Frequently Asked Questions (FAQ)</b>\n\n`;
                    text += `<b>Q1: How does payment verification work?</b>\n`;
                    text += `A: We use live API verification. When you transfer via Telebirr or CBE, provide the Transaction ID from your SMS receipt. Verification checks transaction time (<15 min) and amount.\n\n`;
                    text += `<b>Q2: What if I transfer more than the required amount?</b>\n`;
                    text += `A: If you pay more than expected, your product order is fulfilled and the extra surplus amount is automatically credited directly to your wallet balance!\n\n`;
                    text += `<b>Q3: Can a transaction ID be reused?</b>\n`;
                    text += `A: No. Each transaction ID can only be claimed once. Duplicate IDs are rejected.\n\n`;
                    text += `<b>Q4: When do I get my digital product?</b>\n`;
                    text += `A: Digital licenses and codes are delivered instantly once payment verification passes.`;
                    await safeEditMessage(chatId, messageId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Telegram Support', url: 'https://t.me/VendraSubET' }],
                                [{ text: '< Support', callback_data: 'btn_support' }]
                            ]
                        }
                    });
                }
            }
            catch (error) {
                console.error('Bot callback error:', error);
                safeSendMessage(chatId, 'An unexpected error occurred. Please try again.');
            }
            bot.answerCallbackQuery(query.id).catch(() => { });
        });
        // Handle incoming user text messages (Replied inputs & states)
        bot.on('message', async (msg) => {
            await (0, store_1.awaitHydration)();
            const chatId = msg.chat.id;
            // The purchase-log group must never receive bot replies to ordinary group messages.
            if (chatId === PURCHASE_LOG_GROUP_ID) return;
            if (msg.text && msg.text.startsWith('/') && !(userStates[msg.chat.id]?.action === 'ADMIN_BROADCAST'))
                return;
            if (!isAdminTgUser(msg.from?.id || chatId)) {
                const membership = await checkRequiredMembership(msg.from?.id || chatId);
                if (!membership.ok) {
                    await sendJoinRequired(chatId, membership);
                    return;
                }
            }
            const state = userStates[chatId];
            if (!state)
                return;
            const userId = `tg_${chatId}`;
            const user = (0, store_1.getUser)(userId);
            if (msg.from?.username)
                user.username = msg.from.username;
            // ==========================================
            // ADMIN INTERACTION STATES
            // ==========================================
            // Admin Broadcast State
            if (state.action === 'ADMIN_BROADCAST') {
                // Broadcast the exact message the admin sent: text, photo, video, document,
                // audio, voice, animation, sticker, contact, location, poll, etc.
                // copyMessage preserves the original media/caption without adding a prefix.
                delete userStates[chatId];
                const progressMsg = await safeSendMessage(chatId, `Broadcasting to all registered users...`);
                const result = await broadcastToUsers(msg, false);
                if (progressMsg) {
                    await safeEditMessage(chatId, progressMsg.message_id, `✅ <b>Broadcast Completed!</b>\n\n` +
                        `• Successfully Delivered: <b>${result.sent}</b>\n` +
                        `• Failed / Blocked: <b>${result.failed}</b>\n` +
                        `• Total Registered: <b>${result.total}</b>`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Back to Admin Dashboard', callback_data: 'admin_dashboard' }]]
                        }
                    });
                }
                return;
            }
            // Admin Adjust Balance State
            else if (state.action === 'ADMIN_ADJUST_BALANCE') {
                const deltaStr = msg.text.trim();
                const delta = parseFloat(deltaStr);
                const { targetUserId } = state.data;
                delete userStates[chatId];
                if (isNaN(delta)) {
                    safeSendMessage(chatId, `❌ Invalid number format. Balance adjustment aborted.`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Back to Users', callback_data: 'admin_users_1' }]]
                        }
                    });
                    return;
                }
                const updated = (0, store_1.adjustUserBalanceAdmin)(targetUserId, delta, 'Admin adjustment via Bot');
                safeSendMessage(chatId, `✅ <b>Balance Updated!</b>\n\n` +
                    `User: <b>${escapeHtml(updated.username)}</b> (<code>${escapeHtml(updated.userId)}</code>)\n` +
                    `Adjustment: <code>${delta > 0 ? `+${delta}` : delta} ETB</code>\n` +
                    `New Wallet Balance: <b>${updated.balance.toFixed(2)} ETB</b>`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: '« Back to Users', callback_data: 'admin_users_1' }]]
                    }
                });
                // Notify user if target is on Telegram
                if (targetUserId.startsWith('tg_')) {
                    const targetChatId = Number(targetUserId.replace('tg_', ''));
                    if (!isNaN(targetChatId)) {
                        safeSendMessage(targetChatId, `💰 <b>Wallet Update:</b> An administrator adjusted your wallet balance by <b>${delta > 0 ? `+${delta}` : delta} ETB</b>.\nYour new balance is <code>${updated.balance.toFixed(2)} ETB</code>.`);
                    }
                }
                return;
            }
            // Admin Find User State
            else if (state.action === 'ADMIN_FIND_USER') {
                const query = msg.text.trim().toLowerCase();
                delete userStates[chatId];
                const allUsers = (0, store_1.getAllUsers)();
                const found = allUsers.filter(u => u.userId.toLowerCase().includes(query) ||
                    u.username.toLowerCase().includes(query));
                if (found.length === 0) {
                    safeSendMessage(chatId, `No users found matching "<b>${escapeHtml(query)}</b>".`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Back to Users', callback_data: 'admin_users_1' }]]
                        }
                    });
                    return;
                }
                let text = `🔍 <b>Search Results (${found.length} Matches)</b>\n\n`;
                const keyboard = [];
                found.forEach((u, i) => {
                    const banTag = u.isBanned ? '⛔ [BANNED]' : '✅ [Active]';
                    text += `<b>${i + 1}. ${escapeHtml(u.username)}</b> ${banTag}\n`;
                    text += `   ID: <code>${escapeHtml(u.userId)}</code> | Balance: <code>${u.balance.toFixed(2)} ETB</code>\n\n`;
                    const banButtonText = u.isBanned ? `🟢 Unban` : `🔴 Ban`;
                    keyboard.push([
                        { text: banButtonText, callback_data: `admin_toggle_ban_${u.userId}` },
                        { text: `💰 +Balance`, callback_data: `admin_add_bal_${u.userId}` }
                    ]);
                });
                keyboard.push([{ text: '« Back to Users', callback_data: 'admin_users_1' }]);
                safeSendMessage(chatId, text, {
                    reply_markup: { inline_keyboard: keyboard }
                });
                return;
            }
            // Admin Set Product USD Price State
            else if (state.action === 'ADMIN_SET_PRODUCT_PRICE') {
                const priceStr = msg.text.trim();
                const priceUSD = parseFloat(priceStr);
                const { prodId } = state.data;
                delete userStates[chatId];
                if (isNaN(priceUSD) || priceUSD <= 0) {
                    safeSendMessage(chatId, `❌ Invalid USD price. Operation cancelled.`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Back to Products', callback_data: 'admin_products' }]]
                        }
                    });
                    return;
                }
                const prods = await getProducts();
                const existingProd = prods.find(p => String(p.id) === String(prodId));
                const updated = (0, store_1.updateProduct)(prodId, { priceUSD }, existingProd);
                if (!updated) {
                    safeSendMessage(chatId, `❌ Product not found.`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Back to Products', callback_data: 'admin_products' }]]
                        }
                    });
                    return;
                }
                safeSendMessage(chatId, `✅ <b>Product Price Updated!</b>\n\n` +
                    `Product: <b>${escapeHtml(updated.name)}</b>\n` +
                    `New USD Price: <code>$${updated.priceUSD.toFixed(2)} USD</code>\n` +
                    `Computed ETB Price: <b>${updated.price} ETB</b>\n` +
                    `Formula: <code>(${updated.priceUSD} + 0.45) * 190 = ${updated.price} ETB</code>`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: '« Back to Product', callback_data: `admin_edit_prod_${updated.id}` }]]
                    }
                });
                return;
            }
            // Admin Set Product Stock State
            else if (state.action === 'ADMIN_SET_PRODUCT_STOCK') {
                const stockStr = msg.text.trim();
                const stock = parseInt(stockStr, 10);
                const { prodId } = state.data;
                delete userStates[chatId];
                if (isNaN(stock) || stock < 0) {
                    safeSendMessage(chatId, `❌ Invalid stock number. Operation cancelled.`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Back to Products', callback_data: 'admin_products' }]]
                        }
                    });
                    return;
                }
                const prods = await getProducts();
                const existingProd = prods.find(p => String(p.id) === String(prodId));
                const updated = (0, store_1.updateProduct)(prodId, { stock }, existingProd);
                if (!updated) {
                    safeSendMessage(chatId, `❌ Product not found.`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Back to Products', callback_data: 'admin_products' }]]
                        }
                    });
                    return;
                }
                safeSendMessage(chatId, `✅ <b>Stock Updated!</b>\n\n` +
                    `Product: <b>${escapeHtml(updated.name)}</b>\n` +
                    `New Stock: <b>${updated.stock} units</b>`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: '« Back to Product', callback_data: `admin_edit_prod_${updated.id}` }]]
                    }
                });
                return;
            }
            // Admin Add Product State
            else if (state.action === 'ADMIN_ADD_PRODUCT') {
                const input = msg.text.trim();
                delete userStates[chatId];
                const parts = input.split('|').map(s => s.trim());
                if (parts.length < 2) {
                    safeSendMessage(chatId, `❌ Invalid format. Please provide at least <code>Name | USD_Price</code>.\nExample: <code>Canva Pro | 3.50 | Productivity | 20 | 1-year access</code>`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Back to Products', callback_data: 'admin_products' }]]
                        }
                    });
                    return;
                }
                const [name, usdStr, category, stockStr, description] = parts;
                const priceUSD = parseFloat(usdStr);
                if (isNaN(priceUSD) || priceUSD <= 0) {
                    safeSendMessage(chatId, `❌ Invalid USD price. Addition cancelled.`);
                    return;
                }
                const newProd = (0, store_1.addProduct)({
                    id: `prod-${Date.now()}`,
                    name,
                    priceUSD,
                    category: category || 'General',
                    stock: stockStr ? parseInt(stockStr, 10) : 50,
                    description: description || '',
                    deliveryType: 'instant'
                });
                safeSendMessage(chatId, `🎉 <b>New Product Added Successfully!</b>\n\n` +
                    `• Name: <b>${escapeHtml(newProd.name)}</b>\n` +
                    `• Category: <b>${escapeHtml(newProd.category || 'General')}</b>\n` +
                    `• Base USD: <code>$${newProd.priceUSD.toFixed(2)} USD</code>\n` +
                    `• Auto ETB: <b>${newProd.price} ETB</b>\n` +
                    `• Stock: <b>${newProd.stock}</b>`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '✏️ Manage Product', callback_data: `admin_edit_prod_${newProd.id}` }],
                            [{ text: '« Products Catalog', callback_data: 'admin_products' }]
                        ]
                    }
                });
                return;
            }
            // Admin Create Promo Code State
            else if (state.action === 'ADMIN_CREATE_PROMO') {
                const input = msg.text.trim();
                delete userStates[chatId];
                const parts = input.split('|').map(s => s.trim());
                if (parts.length < 2) {
                    safeSendMessage(chatId, `❌ Invalid format. Please use: <code>CODE | REWARD_ETB | MAX_USES</code>\nExample: <code>FLASH50 | 50 | 500</code>`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: '« Promo Codes', callback_data: 'admin_promos_list' }]]
                        }
                    });
                    return;
                }
                const [code, rewardStr, maxUsesStr] = parts;
                const reward = parseFloat(rewardStr);
                const maxUses = maxUsesStr ? parseInt(maxUsesStr, 10) : 1000;
                if (!code || isNaN(reward) || reward <= 0) {
                    safeSendMessage(chatId, `❌ Invalid reward amount or code name.`);
                    return;
                }
                (0, store_1.createPromoCode)(code, reward, maxUses);
                safeSendMessage(chatId, `🎉 <b>Promo Code Created!</b>\n\n` +
                    `• Code: <code>${escapeHtml(code.toUpperCase())}</code>\n` +
                    `• Reward: <b>+${reward} ETB</b>\n` +
                    `• Max Redemptions: <b>${maxUses}</b>\n\n` +
                    `Customers can now enter <code>${escapeHtml(code.toUpperCase())}</code> under Profile ➔ Redeem Promo Code!`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🎟️ View All Promo Codes', callback_data: 'admin_promos_list' }],
                            [{ text: '« Admin Dashboard', callback_data: 'admin_dashboard' }]
                        ]
                    }
                });
                return;
            }
            // ==========================================
            // STANDARD CUSTOMER STATES
            // ==========================================
            // 1. Search Query
            if (state.action === 'SEARCH_QUERY') {
                const query = msg.text.trim().toLowerCase();
                delete userStates[chatId];
                try {
                    const products = await getProducts();
                    const filtered = products.filter(p => p.name.toLowerCase().includes(query) ||
                        (p.description && p.description.toLowerCase().includes(query)) ||
                        (p.category && p.category.toLowerCase().includes(query)));
                    if (filtered.length === 0) {
                        safeSendMessage(chatId, `No products found matching "<b>${escapeHtml(query)}</b>".`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Search Again', callback_data: 'btn_search_products' }],
                                    [{ text: 'All Products', callback_data: 'btn_products_1' }]
                                ]
                            }
                        });
                        return;
                    }
                    const isAdmin = isAdminTgUser(chatId);
                    const { keyboard } = formatProductListPage(filtered, 1, isAdmin);
                    safeSendMessage(chatId, `<b>Search Results for "${escapeHtml(query)}" (${filtered.length} found):</b>\n\nSelect a product below to view details or buy:`, {
                        reply_markup: { inline_keyboard: keyboard }
                    });
                }
                catch (e) {
                    safeSendMessage(chatId, 'Error searching products.');
                }
            }
            // 2. Pay As You Go Verification for Direct Order
            // 4. Deposit amount -> request transaction ID
            else if (state.action === 'DEPOSIT_AMOUNT') {
                const amount = parseFloat(String(msg.text || '').replace(/,/g, '').trim());
                const method = state.data.method;
                if (!Number.isFinite(amount) || amount < 10) {
                    safeSendMessage(chatId, 'Invalid deposit amount. Please enter an amount of at least 10 ETB.', {
                        reply_markup: { inline_keyboard: [[{ text: 'Cancel', callback_data: 'btn_wallet' }]] }
                    });
                    return;
                }
                userStates[chatId] = {
                    action: 'VERIFY_DEPOSIT',
                    data: { method, expectedAmount: amount }
                };
                safeSendMessage(chatId,
                    `<b>Amount: ${amount.toFixed(2)} ETB</b>\n\n` +
                    `Now complete the transfer to <b>${escapeHtml(veritas_1.PAYMENT_CONFIG[method]?.accountName || 'SINTAYEHU DEBELA ANGESA')}</b>.\n\n` +
                    `Reply with the <b>Transaction ID</b> from your payment receipt.`,
                    { reply_markup: { inline_keyboard: [[{ text: 'Cancel', callback_data: 'btn_wallet' }]] } }
                );
                return;
            }
            // 5. Verify wallet deposit by transaction ID
            else if (state.action === 'VERIFY_DEPOSIT') {
                const transactionId = String(msg.text || '').trim();
                const { method, expectedAmount } = state.data;
                if (!transactionId) {
                    safeSendMessage(chatId, 'Please send the transaction ID.', {
                        reply_markup: { inline_keyboard: [[{ text: 'Cancel', callback_data: 'btn_wallet' }]] }
                    });
                    return;
                }
                try {
                    // Acknowledge the transaction ID immediately so the user never gets stuck
                    // waiting silently while the payment verification API responds.
                    await safeSendMessage(chatId, `<b>Transaction received.</b>\n\nVerifying your payment now. Please wait...`);
                    const result = await (0, veritas_1.verifyPaymentWithVeritas)({
                        transactionId,
                        method,
                        expectedAmount,
                        isDeposit: true
                    });
                    if (!result.success) {
                        delete userStates[chatId];
                        safeSendMessage(chatId, `<b>Deposit Failed</b>\n\n${escapeHtml(result.message || 'Payment could not be verified.')}`, {
                            reply_markup: { inline_keyboard: [[{ text: 'Try Deposit Again', callback_data: 'btn_wallet_deposit' }], [{ text: 'Wallet', callback_data: 'btn_wallet' }]] }
                        });
                        return;
                    }
                    (0, store_1.markTransactionUsed)({
                        transactionId: result.transactionId,
                        userId,
                        amount: result.amount,
                        method,
                        usedAt: new Date().toISOString()
                    });
                    const updated = (0, store_1.updateUserBalance)(userId, result.amount);
                    const deposit = (0, store_1.recordDeposit)({
                        userId,
                        amount: result.amount,
                        method,
                        transactionRef: result.transactionId,
                        status: 'verified',
                        verifiedAt: new Date().toISOString()
                    });
                    delete userStates[chatId];
                    safeSendMessage(chatId,
                        `<b>Deposit Successful</b>\n\n` +
                        `Amount credited: <b>+${result.amount.toFixed(2)} ETB</b>\n` +
                        `Transaction: <code>${escapeHtml(result.transactionId)}</code>\n` +
                        `New Balance: <b>${updated.balance.toFixed(2)} ETB</b>`,
                        { reply_markup: { inline_keyboard: [[{ text: 'Wallet', callback_data: 'btn_wallet' }], [{ text: 'Shop', callback_data: 'btn_products_1' }]] } }
                    );
                } catch (e) {
                    console.error('Deposit verification handler error:', e);
                    delete userStates[chatId];
                    safeSendMessage(chatId, 'Deposit verification failed due to a temporary error. Please try again.', {
                        reply_markup: { inline_keyboard: [[{ text: 'Try Again', callback_data: 'btn_wallet_deposit' }]] }
                    });
                }
                return;
            }
            // 6. Pay-As-You-Go product transaction verification
            else if (state.action === 'VERIFY_PAYG_ORDER') {
                const transactionId = String(msg.text || '').trim();
                const { productId, productName, price, priceUSD, method } = state.data;
                if (!transactionId) {
                    safeSendMessage(chatId, 'Please send the transaction ID.', {
                        reply_markup: { inline_keyboard: [[{ text: 'Cancel', callback_data: `prod_view_${productId}` }]] }
                    });
                    return;
                }
                try {
                    const result = await (0, veritas_1.verifyPaymentWithVeritas)({
                        transactionId,
                        method,
                        expectedAmount: price,
                        isDeposit: false
                    });
                    if (!result.success) {
                        delete userStates[chatId];
                        safeSendMessage(chatId, `<b>Payment Verification Failed</b>\n\n${escapeHtml(result.message || 'Transaction could not be verified.')}`, {
                            reply_markup: { inline_keyboard: [[{ text: 'Try Again', callback_data: `payg_init_${productId}_${method}` }], [{ text: 'Product', callback_data: `prod_view_${productId}` }]] }
                        });
                        return;
                    }
                    const qamifyRes = await (0, qamify_1.placeQamifyOrder)(productId, 1);
                    if (!qamifyRes.success) {
                        delete userStates[chatId];
                        safeSendMessage(chatId, `<b>Order Failed</b>\n\nPayment was verified, but the supplier order could not be completed. Please contact support.\n\n${escapeHtml(qamifyRes.message || 'Supplier error.')}`);
                        return;
                    }
                    const extra = Math.max(0, Number(result.amount) - Number(price));
                    if (extra > 0) (0, store_1.updateUserBalance)(userId, extra);
                    (0, store_1.markTransactionUsed)({
                        transactionId: result.transactionId,
                        userId,
                        amount: result.amount,
                        method,
                        usedAt: new Date().toISOString()
                    });
                    const order = (0, store_1.createOrder)({
                        userId,
                        userName: user.username,
                        productId,
                        productName,
                        qty: 1,
                        totalPrice: price,
                        originalPriceUSD: priceUSD,
                        paymentMethod: method,
                        transactionRef: result.transactionId,
                        status: 'completed',
                        licenseKey: qamifyRes.licenseKey,
                        supplierOrderId: qamifyRes.orderId,
                        verifiedAt: new Date().toISOString()
                    });
                    await logPurchaseToGroup({ userId, productId, productName });
                    delete userStates[chatId];
                    const freshUser = (0, store_1.getUser)(userId);
                    safeSendMessage(chatId,
                        `<b>Order Successful</b>\n\n` +
                        `Product: <b>${escapeHtml(productName)}</b>\n` +
                        `Order ID: <code>${escapeHtml(order.id)}</code>\n` +
                        `Paid: <b>${result.amount.toFixed(2)} ETB</b>\n` +
                        (extra > 0 ? `Extra credited to wallet: <b>+${extra.toFixed(2)} ETB</b>\n` : '') +
                        `\n<b>Your License Key / Voucher:</b>\n<code>${escapeHtml(order.licenseKey || 'N/A')}</code>`,
                        { reply_markup: { inline_keyboard: [[{ text: 'View Orders', callback_data: 'btn_orders' }], [{ text: 'Shop', callback_data: 'btn_products_1' }]] } }
                    );
                    console.log(`PAYG order completed ${order.id} for ${userId}, balance ${freshUser.balance}`);
                } catch (e) {
                    console.error('PAYG verification/order handler error:', e);
                    delete userStates[chatId];
                    safeSendMessage(chatId, 'Payment/order processing failed due to a temporary error. Please try again.', {
                        reply_markup: { inline_keyboard: [[{ text: 'Product', callback_data: `prod_view_${productId}` }]] }
                    });
                }
                return;
            }
            // 7. Redeem Promo Code
            else if (state.action === 'REDEEM_CODE') {
                const code = msg.text.trim();
                delete userStates[chatId];
                const result = (0, store_1.redeemPromoCode)(userId, code);
                if (!result.success) {
                    safeSendMessage(chatId, `<b>Redeem Failed</b>\n\n${escapeHtml(result.message)}`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Try Another Code', callback_data: 'btn_redeem' }],
                                [{ text: '< Back to Profile', callback_data: 'btn_profile' }]
                            ]
                        }
                    });
                    return;
                }
                safeSendMessage(chatId, `<b>Promo Code Redeemed!</b>\n\n` +
                    `<b>+${result.amount} ETB</b> has been added to your wallet!\n` +
                    `New Balance: <code>${user.balance.toFixed(2)} ETB</code>`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Shop Products', callback_data: 'btn_products_1' }],
                            [{ text: 'Profile', callback_data: 'btn_profile' }]
                        ]
                    }
                });
            }
            // 6. Order ID Lookup
            else if (state.action === 'LOOKUP_ORDER_ID') {
                const lookupId = msg.text.trim();
                delete userStates[chatId];
                const order = (0, store_1.getOrderById)(lookupId);
                if (!order) {
                    safeSendMessage(chatId, `<b>Order Not Found</b>\n\nNo order was found matching ID <code>${escapeHtml(lookupId)}</code>. Please check your ID and try again.`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Search Again', callback_data: 'btn_check_order_id' }],
                                [{ text: 'View All Orders', callback_data: 'btn_orders' }]
                            ]
                        }
                    });
                    return;
                }
                let text = `<b>Order Details: ${escapeHtml(order.id)}</b>\n\n`;
                text += `Product: <b>${escapeHtml(order.productName)}</b>\n`;
                text += `Quantity: ${order.qty}\n`;
                text += `Total Price: <code>${order.totalPrice} ETB</code>\n`;
                text += `Payment Method: ${escapeHtml(order.paymentMethod.toUpperCase())}\n`;
                if (order.transactionRef)
                    text += `Transaction Ref: <code>${escapeHtml(order.transactionRef)}</code>\n`;
                text += `Status: [${escapeHtml(order.status.toUpperCase())}]\n`;
                text += `Date: ${new Date(order.createdAt).toLocaleString()}\n\n`;
                text += `<b>License Key / Fulfillment Code:</b>\n<code>${escapeHtml(order.licenseKey || 'N/A')}</code>`;
                safeSendMessage(chatId, text, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Check Another Order', callback_data: 'btn_check_order_id' }],
                            [{ text: 'Browse Products', callback_data: 'btn_products_1' }],
                            [{ text: 'Main Menu', callback_data: 'btn_main_menu' }]
                        ]
                    }
                });
            }
        });
    }
    catch (err) {
        console.error('Error starting telegram bot:', err);
    }
}
function getBotInstance() {
    return botInstance;
}
function getBotHealth() {
    return {
        isPolling: false,
        isWebhook: true,
        uptimeSeconds: Math.floor(process.uptime()),
        lastPing: new Date().toISOString()
    };
}
async function broadcastToUsers(sourceMessage, pin = false) {
    if (!botInstance || !sourceMessage || !sourceMessage.chat || !sourceMessage.message_id) {
        return { sent: 0, failed: 0, total: 0 };
    }
    const users = (0, store_1.getAllUsers)();
    let sent = 0;
    let failed = 0;

    for (const u of users) {
        const numericChatId = Number(String(u.userId).replace('tg_', ''));
        if (!Number.isFinite(numericChatId)) continue;

        try {
            // Telegram's copyMessage works for text and practically all normal
            // message/media types and keeps the exact admin content/caption.
            const copied = await botInstance.copyMessage(
                numericChatId,
                sourceMessage.chat.id,
                sourceMessage.message_id
            );

            if (pin && copied?.message_id) {
                await botInstance.pinChatMessage(
                    numericChatId,
                    copied.message_id,
                    { disable_notification: false }
                ).catch(() => { });
            }
            sent++;
        } catch (err) {
            console.warn(`Failed to send broadcast to user ${u.userId}:`, err?.message || err);
            failed++;
        }
    }

    return { sent, failed, total: users.length };
}

  return module.exports;
})();


// Start Telegram bot in Render webhook mode.
try {
  botModule.initBot();
} catch (err) {
  console.error('Failed to start bot:', err);
  process.exitCode = 1;
}
