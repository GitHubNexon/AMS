const InvoicePaymentLogs = require('../models/InvoicePaymentLogs'); 


// Controller to get all Invoice Payment Logs with pagination and filtering
const getALLinvoicesPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const keyword = req.query.keyword || "";
        const paymentMethods = req.query.paymentMethods ? req.query.paymentMethods.split(',') : []; 

        const params = {};

        if (keyword) {
            params.$or = [
                { 'customerId': keyword }, 
                { 'depositAccount': keyword },
                { 'paymentDate': { $regex: keyword, $options: "i" } }, 
                { 'appliedAmount': parseFloat(keyword) },
                { 'amountReceived': parseFloat(keyword) },
                { 'invoices.invoiceId': keyword } 
            ];
        }

         if (paymentMethods.length > 0) {
            params['payment.method'] = { $in: paymentMethods };
        }


        const totalItems = await InvoicePaymentLogs.countDocuments(params);

        const invoicePayments = await InvoicePaymentLogs.find(params)
            .populate('customerId')
            .populate('depositAccount')
            .populate('invoices.invoiceId')
            .sort({ paymentDate: -1 }) // Sort by paymentDate in descending order
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            invoicePayments,
        });
    } catch (error) {
        console.error('Error fetching invoice payments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};



module.exports = { getALLinvoicesPayments, };
