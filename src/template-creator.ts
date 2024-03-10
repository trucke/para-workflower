import { TFile, Vault } from "obsidian";

export function createResourceTemplate(vault: Vault, file: TFile) {
	let frontMatter: string[] = ["tags:", "  - resource"];

	vault.process(file, (data: string) => {
		data = "---\n" + frontMatter.join("\n") + "\n---\n\n";
		return data;
	});
}

export function createProjectTemplate(vault: Vault, file: TFile) {
	let frontMatter: string[] = ["tags:", "  - project", "completed: false"];

	vault.process(file, (data: string) => {
		data = "---\n" + frontMatter.join("\n") + "\n---\n";
		data += "area:: [[]]\n";
		data += "deadline:: \n";
		data += "status::  #TBD\n";
		data += "---\n"
		return data;
	});
}

