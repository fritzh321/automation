export class Helpers {
	public static dynamicImport = async (packageName: string) => new Function(`return import('${packageName}')`)();
}
