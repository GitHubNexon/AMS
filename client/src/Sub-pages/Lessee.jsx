import React from 'react';
import EntriesShortcut from '../Components/EntriesShortcut';
import SubledgerTable from '../Components/SubledgerTable';

function Lessee() {

    return (
        <>
        <EntriesShortcut />
        <SubledgerTable lesseeOnly={true} />
        </>
    );
}

export default Lessee;