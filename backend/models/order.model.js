const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Delivered'], default: 'Pending' }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;