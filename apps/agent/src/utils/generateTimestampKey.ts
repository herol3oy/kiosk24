export function generateTimestampKey(): string {
	const now = new Date();
	return `${now.toISOString().split(".")[0].replace(/:/g, "-")}Z`;
}
