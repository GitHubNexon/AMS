import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { numberToCurrencyString, formatReadableDate } from '../../helper/helper';
import SOATable from './SOATable';

function StatementOfAccount({ slCode=null, name='', data={} }) {

    useEffect(()=>{
        if(slCode){
            console.log(data);
        }
    }, [slCode]);

    return (
        <div className='flex flex-col text-[0.8em]'>
            {/* <div className='flex p-2 border-b shadow bg-white'>
                <div className='flex-1 flex'>
                    <div className='flex-1'>

                    </div>
                    <span>{slCode} - {name}</span>
                </div>
            </div> */}
            <div className='p-2'>
                <SOATable slCode={slCode} name={name} data={data} />
            </div>
        </div>
    );
}

export default StatementOfAccount;