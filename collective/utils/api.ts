import { ENDPOINT_MAP } from '@kodadot1/static';
import type { Prefix } from '@kodadot1/static';
import { ApiFactory } from '@kodadot1/sub-api';

export const getChainEndpointByPrefix = (prefix: Prefix) => {
	const endpoint: string | undefined = ENDPOINT_MAP[prefix];

	return endpoint;
};

export const api = (prefix: Prefix) => ApiFactory.useApiInstance(getChainEndpointByPrefix(prefix));