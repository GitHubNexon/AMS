import React from 'react';
import SubledgerTable from '../Components/SubledgerTable';
import OrderOfPaymentTable from '../Components/OrderOfPaymentTable';
import BillingTable from '../Components/BillingAndCashiering/BillingTable';

function OrderOfPayment() {

    return (
        <div className='flex flex-col'>
            <div>
                <OrderOfPaymentTable />
            </div>
            <div>
                <BillingTable />
            </div>
            <div>
                <SubledgerTable lesseeOnly={true} />
            </div>
        </div>
    );
}

export default OrderOfPayment;