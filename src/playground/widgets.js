const modules = import.meta.glob("./widgets/*.js", { eager: true });

export const widgets = Object.keys(modules)
  .sort()
  .map((path) => modules[path].default)
  .filter(Boolean);
