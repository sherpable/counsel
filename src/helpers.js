/**
 * Get the available counsel instance.
 *
 * @param  string  abstract
 * @param  array   parameters
 * @return mixed|CounselRunner
 */
global.counsel = (abstract = null, parameters = []) =>
{
    if (! abstract) {
        return require('./CounselRunner').instance;
    }
    
    return require('./CounselRunner').instance.make(abstract, parameters);
}

/**
 * Resolve a service from the CounselRunner instance and assign it to the global object.
 * It is possible to specify an alias name with the keyword 'as' like this:
 * use('Foo as Bar');
 *
 * @param  string  abstract
 * @return mixed
 */
global.use = (abstract) =>
{
    require('./CounselRunner').instance.use(abstract);
}

/**
 * Resolve a service from the CounselRunner instance.
 *
 * @param  string  abstract
 * @return mixed
 */
global.resolve = (abstract) =>
{
    return require('./CounselRunner').instance.resolve(abstract);
}
