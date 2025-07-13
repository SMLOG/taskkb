export async function dynamicImport(path) {
  const module = await import(path);
  return module.default || module;
}
