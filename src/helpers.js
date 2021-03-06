/**
 * Get the available counsel instance.
 *
 * @param  string  abstract
 * @param  array   parameters
 * @return mixed|App
 */
global.counsel = (abstract = null, parameters = []) =>
{
    if (! abstract) {
        return require('./App').instance;
    }
    
    return require('./App').instance.make(abstract, parameters);
}

/**
 * Resolve a service from the App instance and assign it to the global object.
 * It is possible to specify an alias name with the keyword 'as' like this:
 * use('Foo as Bar');
 *
 * @param  string  abstract
 * @return mixed
 */
global.counsel_use = (abstract) =>
{
    counsel().use(abstract);
}

/**
 * Resolve a service from the App instance.
 *
 * @param  string  abstract
 * @return mixed
 */
global.counsel_resolve = (abstract) =>
{
    return counsel().resolve(abstract);
}
