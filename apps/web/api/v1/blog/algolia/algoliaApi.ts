import { checkGraphqlResponse } from '../../utils/commonHelper';
import api from '@whatsnxt/core-util/src/ApiClient/XiorInstance';
import { RESET_ALGOLIA_MUTATION } from './../gqlQueries/algoliaQuery';


export const AlgoliaAPI = {
    resetAlgolia: async function () {
        const { data } = await api.request({
            data: {
                query: RESET_ALGOLIA_MUTATION,
                variables: {},
            },
        });

        return checkGraphqlResponse(data).resetAlgolia;
    },
}
