export const getPaymentType = ({ method, bank, wallet, cardNetwork, cardLast4 }) => {
    switch (method) {
        case 'card':
            return `${method}: ${cardNetwork} ${cardLast4}`
        case 'netbanking':
            return `${method}: ${bank}`
        case 'wallet':
            return `${method}: ${wallet}`
        default:
            break;
    }
}
