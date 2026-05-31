import { Router } from 'express';
import {
  createOrder,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  getCustomerOrders,
  getRiderOrders,
  getOrderDetails,
  sendChatMessage,
  rateOrderRider,
} from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes are protected by auth middleware
router.use(authenticate);

router.post('/', createOrder);
router.get('/available', getAvailableOrders);
router.post('/accept', acceptOrder);
router.post('/status', updateOrderStatus);
router.get('/customer', getCustomerOrders);
router.get('/rider', getRiderOrders);
router.post('/:id/chat', sendChatMessage);
router.post('/:id/rate', rateOrderRider);
router.get('/:id', getOrderDetails);

export { router as orderRouter };
