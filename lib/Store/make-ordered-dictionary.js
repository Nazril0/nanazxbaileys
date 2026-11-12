export function makeOrderedDictionary(idGetter) {
    const array = [];
    const dict = {};

    const get = id => dict[id];

    const update = item => {
        const id = idGetter(item);
        const idx = array.findIndex(i => idGetter(i) === id);
        if (idx >= 0) {
            array[idx] = item;
            dict[id] = item;
        }
        return false;
    };

    const upsert = (item, mode) => {
        const id = idGetter(item);
        if (get(id)) {
            update(item);
        } else {
            if (mode === 'append') {
                array.push(item);
            } else {
                array.splice(0, 0, item);
            }
            dict[id] = item;
        }
    };

    const remove = item => {
        const id = idGetter(item);
        const idx = array.findIndex(i => idGetter(i) === id);
        if (idx >= 0) {
            array.splice(idx, 1);
            delete dict[id];
            return true;
        }
        return false;
    };

    const filter = func => array.filter(func);

    const toJSON = () => array;

    return { array, dict, get, update, upsert, remove, filter, toJSON };
}
