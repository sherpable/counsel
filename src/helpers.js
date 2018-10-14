global.counsel = (abstract = null, parameters = []) =>
{
    if (! abstract) {
        return require('./CounselRunner').instance;
    }
    
    return require('./CounselRunner').instance.make(abstract, parameters);
}

global.use = (abstract) =>
{
    require('./CounselRunner').instance.use(abstract);
}

global.resolve = (abstract) =>
{
    return require('./CounselRunner').instance.resolve(abstract);
}