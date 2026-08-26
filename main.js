// MERGED SINGLE-FILE VERSION
// Original project logic is embedded without changing its application behavior.
const http = require('http');
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
async function placeQamifyOrder(productId, qty = 1) {
    const apiKey = 'qamify_9713b8cd438598710bf410735c6f692aaba9ebc244715430';
    // Ensure product_id is formatted properly
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
            body: JSON.stringify({
                product_id: targetProductId,
                qty: targetQty
            })
        });
        const responseText = await res.text();
        let resData = {};
        try {
            resData = JSON.parse(responseText);
        }
        catch {
            resData = { raw: responseText };
        }
        if (!res.ok) {
            console.error(`Qamify order API error (${res.status}):`, resData);
            const errMsg = resData?.message ||
                (typeof resData?.error === 'string' ? resData.error : resData?.error?.message) ||
                (resData?.error ? JSON.stringify(resData.error) : `Qamify API returned status ${res.status}`);
            return {
                success: false,
                message: errMsg,
                data: resData
            };
        }
        // Extract license key / code / credentials from response
        const keyCandidates = [
            resData.license_key,
            resData.licenseKey,
            resData.code,
            resData.voucher,
            resData.key,
            resData.credentials,
            resData.data?.license_key,
            resData.data?.licenseKey,
            resData.data?.code,
            resData.data?.voucher,
            resData.data?.key,
            resData.data?.credentials,
            Array.isArray(resData.data?.keys) ? resData.data.keys.join('\n') : undefined,
            Array.isArray(resData.keys) ? resData.keys.join('\n') : undefined
        ];
        let licenseKey = undefined;
        for (const cand of keyCandidates) {
            if (cand !== undefined && cand !== null && String(cand).trim().length > 0) {
                licenseKey = String(cand).trim();
                break;
            }
        }
        return {
            success: true,
            message: resData.message || 'Order placed successfully on supplier system.',
            data: resData,
            licenseKey,
            orderId: resData.id || resData.order_id || resData.data?.id
        };
    }
    catch (err) {
        console.error('Failed to submit Qamify supplier order:', err);
        return {
            success: false,
            message: err.message || 'Failed to communicate with Qamify supplier API.'
        };
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
exports.redeemProductCoupon = redeemProductCoupon;
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
function redeemProductCoupon(userId, rawCode, productId) {
    const code = rawCode.trim().toUpperCase();
    const user = getUser(userId);
    const products = getProductsList();
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) {
        return { success: false, message: 'Product not found.' };
    }
    if (user.redeemedCodes.includes(code)) {
        return { success: false, message: `Coupon code "${code}" has already been used by your account.` };
    }
    const promo = globalStore.__nexora_promo_codes[code];
    if (!promo) {
        return { success: false, message: `Invalid coupon code "${code}". Please check your code and try again.` };
    }
    if (promo.currentUses >= promo.maxUses) {
        return { success: false, message: `Coupon code "${code}" has reached its maximum redemption limit.` };
    }
    // Deduct usage and track redemption
    promo.currentUses += 1;
    (0, firebaseDb_1.saveToFirebase)('promo_codes', code, promo);
    user.redeemedCodes.push(code);
    // Create completed 0 ETB order for this product
    const order = createOrder({
        userId,
        userName: user.username,
        productId: product.id,
        productName: product.name,
        qty: 1,
        totalPrice: 0,
        originalPriceUSD: product.priceUSD,
        paymentMethod: 'admin_redeem',
        status: 'completed',
        verifiedAt: new Date().toISOString()
    });
    return {
        success: true,
        message: `Coupon code "${code}" redeemed successfully! Product key generated.`,
        order
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
        const response = await fetch(`${VERITAS_BASE_URL}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VERITAS_API_KEY}`,
                'x-api-key': VERITAS_API_KEY
            },
            body: JSON.stringify(payload)
        });
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
        const rawAmount = data.amount || data.data?.amount || data.trans_amount || data.verified_amount || data.data?.settledAmount || data.data?.totalPaidAmount;
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
            message: `Verification system error: ${error.message || 'Unable to connect to verification server'}.`
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

const PURCHASE_LOG_GROUP_ID = -1003927927908;
const BOT_PUBLIC_USERNAME = 'VendraSub';

function maskTelegramId(id) {
    const raw = String(id ?? '');
    if (raw.length <= 3) return raw;
    if (raw.length <= 5) return raw.slice(0, 1) + '***' + raw.slice(-1);
    return raw.slice(0, 3) + '***' + raw.slice(-2);
}

async function logSuccessfulPurchase({ userId, productId, productName }) {
    if (!botInstance) return;
    try {
        const tgId = String(userId).replace(/^tg_/, '');
        const masked = maskTelegramId(tgId);
        const safeName = escapeHtml(productName || 'Unknown Product');
        const startParam = `product_${String(productId)}`;
        const productUrl = `https://t.me/${BOT_PUBLIC_USERNAME}?start=${encodeURIComponent(startParam)}`;
        await botInstance.sendMessage(
            PURCHASE_LOG_GROUP_ID,
            `User ${masked} (tg id: ${masked}) bought ${safeName}.`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: 'View Product', url: productUrl }]]
                }
            }
        );
        console.log(`Purchase logged: ${masked} -> ${productId} (${productName})`);
    } catch (err) {
        console.error('Failed to log purchase to group:', err?.message || err);
    }
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
        // Initialize bot without long polling for Render Webhook support
        const bot = new node_telegram_bot_api_1.default(token);
        botInstance = bot;
        console.log('Telegram bot initialized in Webhook mode for Render');

        bot.on('error', (err) => {
            console.warn('Telegram bot general warning:', err?.message || err);
        });
        bot.on('webhook_error', (err) => {
            console.warn('Telegram webhook warning:', err?.message || err);
        });

        // Set up Webhook HTTP Server for Render
        const PORT = process.env.PORT || 10000;
        const server = http.createServer((req, res) => {
            if (req.method === 'POST' && req.url === `/bot${token}`) {
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', () => {
                    try {
                        const update = JSON.parse(body);
                        bot.processUpdate(update);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ ok: true }));
                    } catch (err) {
                        console.error('Failed to parse incoming Telegram update:', err);
                        res.writeHead(400);
                        res.end();
                    }
                });
            } else if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', service: 'Vendra Sub Webhook Server' }));
            } else {
                res.writeHead(404);
                res.end();
            }
        });

        server.listen(PORT, async () => {
            console.log(`Webhook server is listening on port ${PORT}`);
            const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.WEBHOOK_URL;
            if (publicUrl) {
                const webhookEndpoint = `${publicUrl.replace(/\/+$/, '')}/bot${token}`;
                try {
                    await bot.setWebHook(webhookEndpoint);
                    console.log(`Telegram Webhook successfully configured to: ${webhookEndpoint}`);
                } catch (err) {
                    console.error('Failed to register webhook with Telegram API:', err);
                }
            } else {
                console.log('RENDER_EXTERNAL_URL is not set yet. The server is ready to accept webhooks when configured.');
            }
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
                            stock: override.stock !== undefined ? override.stock : liveProd.stock
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
            delete userStates[chatId];
            if (checkUserBanned(chatId))
                return;
            const user = (0, store_1.getUser)(`tg_${chatId}`);
            user.username = msg.from?.username || msg.from?.first_name || `User_${chatId}`;
            // Handle product deep links from purchase logs
            const param = match && match[1] ? match[1].trim() : '';
            if (param.startsWith('product_')) {
                const productId = param.replace('product_', '');
                const products = await getProducts();
                const product = products.find(p => String(p.id) === String(productId));
                if (product) {
                    const text = `<b>${escapeHtml(product.name)}</b>\\n\\n` +
                        `<b>Description:</b>\\n${escapeHtml(product.description || 'Instant automated digital delivery.')}\\n\\n` +
                        `Price: <b>${product.price} ETB</b>\\n` +
                        `Stock: <b>${product.stock !== undefined && product.stock !== null ? product.stock : 'Unlimited'}</b>`;
                    await safeSendMessage(chatId, text, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: `Buy (${product.price} ETB)`, callback_data: `prod_view_${product.id}` }],
                                [{ text: 'Shop', callback_data: 'btn_products_1' }]
                            ]
                        }
                    });
                    return;
                }
            }
            // Check for referral start parameter
            if (param.startsWith('ref_')) {
                const refCode = param.replace('ref_', '');
                if (!user.referredBy && refCode !== user.referralCode) {
                    user.referredBy = refCode;
                    console.log(`User ${chatId} referred by ${refCode}`);
                }
            }
            const welcomeText = `<b>Welcome to Vendra Sub, ${escapeHtml(msg.from?.first_name || 'Customer')}!</b>\n\n` +
                `Instant automated delivery of premium digital goods, vouchers & top-ups.\n` +
                `Live automated verification for Telebirr & CBE payments.\n\n` +
                `<b>Your Wallet Balance:</b> <code>${user.balance.toFixed(2)} ETB</code>\n\n` +
                `Select an option from the menu below:`;
            await safeSendMessage(chatId, welcomeText, getMainMenuKeyboard());
        });
        // Command: /admin
        bot.onText(/\/admin/, async (msg) => {
            await (0, store_1.awaitHydration)();
            const chatId = msg.chat.id;
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
            const fromId = query.from?.id || chatId;
            const messageId = query.message.message_id;
            const data = query.data;
            const userId = `tg_${fromId}`;
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
                        `Please reply with the message you want to broadcast.\n` +
                        `Supports HTML (e.g. &lt;b&gt;bold&lt;/b&gt;, &lt;code&gt;code&lt;/code&gt;).\n\n` +
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
                // 2. Products List
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
                    // Action row: Deposit & Redeem side by side
                    keyboard.push([
                        { text: 'Deposit', callback_data: 'btn_wallet_deposit' },
                        { text: '🎁 Redeem Code', callback_data: `payg_redeem_${product.id}` }
                    ]);
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
                    await logSuccessfulPurchase({
                        userId,
                        productId: product.id,
                        productName: product.name
                    });
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
                        [
                            { text: 'Deposit', callback_data: 'btn_wallet_deposit' },
                            { text: '🎁 Redeem Code', callback_data: `payg_redeem_${product.id}` }
                        ],
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
                // 6b. Direct Pay-As-You-Go Redeem Code Initiation
                else if (data.startsWith('payg_redeem_')) {
                    delete userStates[chatId];
                    const prodId = data.replace('payg_redeem_', '');
                    const products = await getProducts();
                    const product = products.find(p => String(p.id) === String(prodId));
                    if (!product) {
                        safeSendMessage(chatId, '❌ Product not found.');
                        return;
                    }
                    const sent = await safeSendMessage(chatId, `🎁 <b>Redeem Coupon Code for ${escapeHtml(product.name)}</b>\n\n` +
                        `Please reply to this message with your coupon / promo code created for this product:`, {
                        reply_markup: {
                            force_reply: true,
                            inline_keyboard: [[{ text: 'Cancel', callback_data: `prod_view_${product.id}` }]]
                        }
                    });
                    if (sent) {
                        userStates[chatId] = {
                            action: 'REDEEM_PRODUCT_COUPON',
                            data: {
                                productId: product.id,
                                promptMsgId: sent.message_id
                            }
                        };
                    }
                }
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
            if (!msg.text || msg.text.startsWith('/'))
                return;
            const chatId = msg.chat.id;
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
                const text = msg.text.trim();
                delete userStates[chatId];
                const progressMsg = await safeSendMessage(chatId, `📢 Broadcasting announcement to all registered users...`);
                const result = await broadcastToUsers(text, false);
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
            else if (state.action === 'REDEEM_PRODUCT_COUPON') {
                const code = msg.text.trim();
                const { productId } = state.data;
                delete userStates[chatId];
                const result = (0, store_1.redeemProductCoupon)(userId, code, productId);
                if (!result.success) {
                    await safeSendMessage(chatId, `❌ <b>Redemption Failed</b>\n\n${escapeHtml(result.message)}`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🔄 Try Again', callback_data: `payg_redeem_${productId}` }],
                                [{ text: '« Back to Product', callback_data: `prod_view_${productId}` }],
                                [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                            ]
                        }
                    });
                    return;
                }
                const order = result.order;
                let text = `🎉 <b>Product Redeemed Successfully!</b>\n\n`;
                text += `• Product: <b>${escapeHtml(order.productName)}</b>\n`;
                text += `• Order ID: <code>${escapeHtml(order.id)}</code>\n`;
                text += `• Coupon Code: <code>${escapeHtml(code.toUpperCase())}</code>\n`;
                text += `• Status: <b>Completed</b>\n\n`;
                text += `<b>Your License Key / Voucher:</b>\n<code>${escapeHtml(order.licenseKey || 'N/A')}</code>\n\n`;
                text += `Thank you for choosing Vendra Sub!`;
                await safeSendMessage(chatId, text, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '📜 View Orders', callback_data: 'btn_orders' }],
                            [{ text: '🛍️ Shop Catalog', callback_data: 'btn_products_1' }],
                            [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                        ]
                    }
                });
            }
            else if (state.action === 'VERIFY_PAYG_ORDER') {
                const txId = msg.text.trim();
                const { productId, productName, price, priceUSD, method } = state.data;
                delete userStates[chatId];
                const verifyingMsg = await safeSendMessage(chatId, `<b>Verifying transaction <code>${escapeHtml(txId)}</code>...</b>\nChecking amount, age (<15 min), and recipient name.`);
                try {
                    const result = await (0, veritas_1.verifyPaymentWithVeritas)({
                        transactionId: txId,
                        method,
                        expectedAmount: price
                    });
                    if (!result.success) {
                        const failText = `<b>Payment Verification Failed</b>\n\n` +
                            `Transaction ID: <code>${escapeHtml(txId)}</code>\n` +
                            `Provider: <b>${escapeHtml(method.toUpperCase())}</b>\n\n` +
                            `<b>🔴 Error Reason:</b>\n${escapeHtml(result.message)}`;
                        if (verifyingMsg) {
                            await safeEditMessage(chatId, verifyingMsg.message_id, failText, {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: '🔄 Try Again', callback_data: `payg_init_${productId}_${method}` }],
                                        [{ text: '« Back to Product', callback_data: `prod_view_${productId}` }],
                                        [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                                    ]
                                }
                            });
                        }
                        else {
                            await safeSendMessage(chatId, failText, {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: '🔄 Try Again', callback_data: `payg_init_${productId}_${method}` }],
                                        [{ text: '« Back to Product', callback_data: `prod_view_${productId}` }],
                                        [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                                    ]
                                }
                            });
                        }
                        return;
                    }
                    // Payment verified successfully
                    const paidAmount = result.amount || price;
                    const surplus = paidAmount > price ? Number((paidAmount - price).toFixed(2)) : 0;
                    // Submit supplier order to Qamify API
                    const qamifyRes = await (0, qamify_1.placeQamifyOrder)(productId, 1);
                    if (!qamifyRes.success) {
                        // Refund full verified amount to wallet!
                        (0, store_1.updateUserBalance)(userId, paidAmount);
                        (0, store_1.markTransactionUsed)({
                            transactionId: txId,
                            method: method,
                            amount: paidAmount,
                            userId,
                            orderId: 'wallet-refund-fallback',
                            usedAt: new Date().toISOString(),
                            txTimestamp: result.txTimestamp
                        });
                        await safeSendMessage(chatId, `❌ <b>Supplier Fulfillment Failed</b>\n\nWe verified your payment of <code>${paidAmount} ETB</code>, but the supplier API failed: <i>${escapeHtml(qamifyRes.message || 'Product unavailable')}</i>.\n\nThe full amount of <b>${paidAmount} ETB</b> has been safely credited to your wallet balance. You can try ordering again later using your wallet.`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '« Back to Product', callback_data: `prod_view_${productId}` }],
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
                        productId,
                        productName,
                        qty: 1,
                        totalPrice: price,
                        originalPriceUSD: priceUSD,
                        paymentMethod: method,
                        transactionRef: txId,
                        status: 'completed',
                        licenseKey: qamifyRes.licenseKey,
                        surplusAddedToWallet: surplus,
                        verifiedAt: new Date().toISOString()
                    });
                    await logSuccessfulPurchase({
                        userId,
                        productId,
                        productName
                    });
                    (0, store_1.markTransactionUsed)({
                        transactionId: txId,
                        method,
                        amount: paidAmount,
                        userId,
                        orderId: order.id,
                        txTimestamp: result.txTimestamp
                    });
                    let currentBalance = user.balance;
                    if (surplus > 0) {
                        const updatedUser = (0, store_1.updateUserBalance)(userId, surplus);
                        currentBalance = updatedUser.balance;
                    }
                    let successText = `<b>Payment Verified & Order Fulfilled!</b>\n\n`;
                    successText += `Product: <b>${escapeHtml(productName)}</b>\n`;
                    successText += `Order ID: <code>${escapeHtml(order.id)}</code>\n`;
                    successText += `Verified Amount: <code>${paidAmount} ETB</code> (${escapeHtml(method.toUpperCase())})\n`;
                    successText += `Transaction ID: <code>${escapeHtml(txId)}</code>\n`;
                    if (surplus > 0) {
                        successText += `\n<b>Surplus Bonus:</b> You transferred +${surplus} ETB extra, which has been automatically added to your wallet balance!\n`;
                        successText += `New Wallet Balance: <code>${currentBalance.toFixed(2)} ETB</code>\n`;
                    }
                    successText += `\n<b>Your License Key / Voucher:</b>\n<code>${escapeHtml(order.licenseKey || 'N/A')}</code>\n\n`;
                    successText += `Thank you for shopping with Vendra Sub!`;
                    if (verifyingMsg) {
                        await safeEditMessage(chatId, verifyingMsg.message_id, successText, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '📜 View All Orders', callback_data: 'btn_orders' }],
                                    [{ text: '🛍️ Browse Products', callback_data: 'btn_products_1' }],
                                    [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                                ]
                            }
                        });
                    }
                    else {
                        await safeSendMessage(chatId, successText, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '📜 View All Orders', callback_data: 'btn_orders' }],
                                    [{ text: '🛍️ Browse Products', callback_data: 'btn_products_1' }],
                                    [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                                ]
                            }
                        });
                    }
                }
                catch (e) {
                    const errText = `❌ <b>Error verifying payment:</b> ${escapeHtml(e.message || 'Unknown network error')}`;
                    const errKeyboard = [
                        [{ text: '🔄 Try Again', callback_data: `payg_init_${productId}_${method}` }],
                        [{ text: '« Back to Product', callback_data: `prod_view_${productId}` }],
                        [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                    ];
                    if (verifyingMsg) {
                        await safeEditMessage(chatId, verifyingMsg.message_id, errText, {
                            reply_markup: { inline_keyboard: errKeyboard }
                        });
                    }
                    else {
                        await safeSendMessage(chatId, errText, {
                            reply_markup: { inline_keyboard: errKeyboard }
                        });
                    }
                }
            }
            // 3. Deposit Amount Specified -> Prompt for Transaction ID
            else if (state.action === 'DEPOSIT_AMOUNT') {
                const amountStr = msg.text.trim();
                const amount = parseFloat(amountStr);
                const { method } = state.data;
                delete userStates[chatId];
                if (isNaN(amount) || amount < 10) {
                    safeSendMessage(chatId, `Minimum deposit amount is <b>10 ETB</b>. Please enter a valid number.`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Try Again', callback_data: `deposit_method_${method}` }],
                                [{ text: '< Wallet', callback_data: 'btn_wallet' }]
                            ]
                        }
                    });
                    return;
                }
                const config = veritas_1.PAYMENT_CONFIG[method];
                let text = `<b>Transfer ${amount} ETB to Deposit</b>\n\n`;
                text += `• Receiver Account: <code>${escapeHtml(config.accountNumber)}</code>\n`;
                text += `• Receiver Name: <b>${escapeHtml(config.accountName)}</b>\n`;
                text += `• Required Amount: <b>${amount} ETB</b>\n\n`;
                text += `Please transfer <b>${amount} ETB</b> via your ${escapeHtml(config.name)} app or USSD, then reply to this message with your <b>Transaction ID</b> from the SMS receipt.`;
                const sent = await safeSendMessage(chatId, text, {
                    reply_markup: {
                        force_reply: true,
                        inline_keyboard: [[{ text: 'Cancel', callback_data: 'btn_wallet' }]]
                    }
                });
                if (sent) {
                    userStates[chatId] = {
                        action: 'VERIFY_DEPOSIT',
                        data: { method, amount, promptMsgId: sent.message_id }
                    };
                }
            }
            // 4. Verify Deposit Transaction ID
            else if (state.action === 'VERIFY_DEPOSIT') {
                const txId = msg.text.trim();
                const { method, amount } = state.data;
                delete userStates[chatId];
                const verifyingMsg = await safeSendMessage(chatId, `<b>Verifying deposit of ${amount} ETB...</b>`);
                try {
                    const result = await (0, veritas_1.verifyPaymentWithVeritas)({
                        transactionId: txId,
                        method,
                        expectedAmount: amount,
                        isDeposit: true
                    });
                    if (!result.success) {
                        const failText = `<b>Deposit Verification Failed</b>\n\n` +
                            `<b>🔴 Error Reason:</b>\n${escapeHtml(result.message)}`;
                        if (verifyingMsg) {
                            await safeEditMessage(chatId, verifyingMsg.message_id, failText, {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: 'Try Again', callback_data: `deposit_method_${method}` }],
                                        [{ text: '< Wallet', callback_data: 'btn_wallet' }]
                                    ]
                                }
                            });
                        }
                        else {
                            await safeSendMessage(chatId, failText);
                        }
                        return;
                    }
                    // Verified
                    const finalAmount = result.amount || amount;
                    const updatedUser = (0, store_1.updateUserBalance)(userId, finalAmount);
                    const dep = (0, store_1.recordDeposit)({
                        userId,
                        method,
                        amount: finalAmount,
                        transactionRef: txId,
                        status: 'verified',
                        verifiedAt: new Date().toISOString()
                    });
                    (0, store_1.markTransactionUsed)({
                        transactionId: txId,
                        method,
                        amount: finalAmount,
                        userId,
                        depositId: dep.id,
                        txTimestamp: result.txTimestamp
                    });
                    let text = `<b>Deposit Verified & Credited!</b>\n\n`;
                    text += `Deposited: <code>+${finalAmount} ETB</code> (${escapeHtml(method.toUpperCase())})\n`;
                    text += `Transaction ID: <code>${escapeHtml(txId)}</code>\n`;
                    text += `New Wallet Balance: <code>${updatedUser.balance.toFixed(2)} ETB</code>\n\n`;
                    text += `You can now use your balance to purchase any product instantly.`;
                    if (verifyingMsg) {
                        await safeEditMessage(chatId, verifyingMsg.message_id, text, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '🛍️ Shop Products', callback_data: 'btn_products_1' }],
                                    [{ text: '💳 View Wallet', callback_data: 'btn_wallet' }],
                                    [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                                ]
                            }
                        });
                    }
                    else {
                        await safeSendMessage(chatId, text, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '🛍️ Shop Products', callback_data: 'btn_products_1' }],
                                    [{ text: '💳 View Wallet', callback_data: 'btn_wallet' }],
                                    [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                                ]
                            }
                        });
                    }
                }
                catch (e) {
                    const errText = `❌ <b>Deposit verification error:</b> ${escapeHtml(e.message || 'Unknown network error')}`;
                    const errKeyboard = [
                        [{ text: '🔄 Try Again', callback_data: `deposit_method_${method}` }],
                        [{ text: '💳 Back to Wallet', callback_data: 'btn_wallet' }],
                        [{ text: '🏠 Main Menu', callback_data: 'btn_main_menu' }]
                    ];
                    if (verifyingMsg) {
                        await safeEditMessage(chatId, verifyingMsg.message_id, errText, {
                            reply_markup: { inline_keyboard: errKeyboard }
                        });
                    }
                    else {
                        await safeSendMessage(chatId, errText, {
                            reply_markup: { inline_keyboard: errKeyboard }
                        });
                    }
                }
            }
            // 5. Redeem Promo Code
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
async function broadcastToUsers(messageHtml, pin = false) {
    if (!botInstance) {
        return { sent: 0, failed: 0, total: 0 };
    }
    const users = (0, store_1.getAllUsers)();
    let sent = 0;
    let failed = 0;
    const formattedMsg = `<b>Announcement from Admin:</b>\n\n${messageHtml}`;
    for (const u of users) {
        const numericChatId = Number(u.userId.replace('tg_', ''));
        if (!isNaN(numericChatId)) {
            try {
                const msg = await botInstance.sendMessage(numericChatId, formattedMsg, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Open Store', callback_data: 'btn_products_1' }]
                        ]
                    }
                });
                if (pin && msg.message_id) {
                    await botInstance.pinChatMessage(numericChatId, msg.message_id, { disable_notification: false }).catch(() => { });
                }
                sent++;
            }
            catch (err) {
                console.warn(`Failed to send broadcast to user ${u.userId}:`, err);
                failed++;
            }
        }
    }
    return { sent, failed, total: users.length };
}

  return module.exports;
})();


// Start Telegram bot Webhook server for Render
try {
  botModule.initBot();
} catch (err) {
  console.error('Failed to start bot server:', err);
}
