export interface RuleNode<T> {
	id: string;
	name: string;
	kind: string;
	config: T;
}
