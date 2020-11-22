// used to save state across multiple invocations to a stateless RESTFUL API endpoint

export interface GenericCache<O, IDX> {
    o: O;                       // cache object
    cacheIdx: IDX;                   // cache index - use to determine if object cache is valid
    isCached: boolean;          // determine if cache has been populate
}

export function initCache<O, IDX>(initialObj: O, initialCacheIdx: IDX): GenericCache<O, IDX> {
    let rv: GenericCache<O, IDX> = {
        o: initialObj,
        cacheIdx: initialCacheIdx,
        isCached: false
    }
    return rv;
}