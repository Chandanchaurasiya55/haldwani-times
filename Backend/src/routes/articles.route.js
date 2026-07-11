import express from 'express';
import {
  getPublicArticles,
  createArticle,
  getMySubmissions,
  createBlogPost,
  getPendingArticles,
  updateArticleStatus,
  getReporters,
  updateReporterStatus,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  getAds,
  updateAd,
  createPaymentOrder,
  submitAdBid,
  getUserBids,
  getAllBids,
  updateBidStatus
} from '../controller/articlesController.js';

const router = express.Router();

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// @route   GET /api/articles
router.get('/', getPublicArticles);

// ==========================================
// REPORTER ENDPOINTS
// ==========================================

// @route   POST /api/articles
router.post('/', createArticle);

// @route   GET /api/articles/my-submissions/:authorId
router.get('/my-submissions/:authorId', getMySubmissions);

// @route   POST /api/articles/blog
router.post('/blog', createBlogPost);

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// @route   GET /api/articles/pending
router.get('/pending', getPendingArticles);

// @route   PUT /api/articles/:id/status
router.put('/:id/status', updateArticleStatus);

// @route   GET /api/articles/admin/reporters
router.get('/admin/reporters', getReporters);

// @route   PUT /api/articles/admin/reporters/:id/status
router.put('/admin/reporters/:id/status', updateReporterStatus);

// ==========================================
// BOOKMARKS ENDPOINTS
// ==========================================

// @route   POST /api/articles/bookmark
router.post('/bookmark', addBookmark);

// @route   POST /api/articles/unbookmark
router.post('/unbookmark', removeBookmark);

// @route   GET /api/articles/bookmarks/:userId
router.get('/bookmarks/:userId', getUserBookmarks);

// ==========================================
// ADS MANAGEMENT ENDPOINTS
// ==========================================

// @route   GET /api/articles/ads
router.get('/ads', getAds);

// @route   PUT /api/articles/ads
router.put('/ads', updateAd);

// ==========================================
// AD BIDDING SYSTEM
// ==========================================

// @route   POST /api/articles/ad-bids/payment-order
router.post('/ad-bids/payment-order', createPaymentOrder);

// @route   POST /api/articles/ad-bids
router.post('/ad-bids', submitAdBid);

// @route   GET /api/articles/ad-bids/user/:userId
router.get('/ad-bids/user/:userId', getUserBids);

// @route   GET /api/articles/ad-bids
router.get('/ad-bids', getAllBids);

// @route   PUT /api/articles/ad-bids/:id/status
router.put('/ad-bids/:id/status', updateBidStatus);

export default router;
