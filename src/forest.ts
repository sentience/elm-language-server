import { Tree } from "web-tree-sitter";
import { Exposing, TreeUtils } from "./util/treeUtils";

export interface ITreeContainer {
  uri: string;
  writeable: boolean;
  referenced: boolean;
  moduleName?: string;
  maintainerAndPackageName?: string;
  exposing?: Exposing;
  tree: Tree;
}

export interface IForest {
  treeIndex: ITreeContainer[];
  getTree(uri: string): Tree | undefined;
  getExposingByModuleName(moduleName: string): Exposing | undefined;
  getTreeByModuleName(moduleName: string): Tree | undefined;
  getByModuleName(moduleName: string): ITreeContainer | undefined;
  getByUri(uri: string): ITreeContainer | undefined;
  setTree(
    uri: string,
    writeable: boolean,
    referenced: boolean,
    tree: Tree,
    packageName?: string,
  ): void;
  removeTree(uri: string): void;
}

export class Forest implements IForest {
  public treeIndex: ITreeContainer[] = [];

  public getTree(uri: string): Tree | undefined {
    const result = this.treeIndex.find(tree => tree.uri === uri);

    return result && result.tree;
  }

  public getExposingByModuleName(moduleName: string): Exposing | undefined {
    const result = this.treeIndex.find(tree => tree.moduleName === moduleName);
    return result && result.exposing;
  }

  public getTreeByModuleName(moduleName: string): Tree | undefined {
    const result = this.treeIndex.find(tree => tree.moduleName === moduleName);

    return result && result.tree;
  }

  public getByModuleName(moduleName: string): ITreeContainer | undefined {
    return this.treeIndex.find(tree => tree.moduleName === moduleName);
  }

  public getByUri(uri: string): ITreeContainer | undefined {
    return this.treeIndex.find(tree => tree.uri === uri);
  }

  public setTree(
    uri: string,
    writeable: boolean,
    referenced: boolean,
    tree: Tree,
    maintainerAndPackageName?: string,
  ): void {
    const moduleResult = TreeUtils.getModuleNameAndExposing(tree);
    let moduleName: string | undefined;
    let exposing: Exposing | undefined;
    if (moduleResult) {
      ({ moduleName, exposing } = moduleResult);
    }

    const existingTree = this.treeIndex.findIndex(a => a.uri === uri);

    const treeContainer = {
      exposing,
      maintainerAndPackageName,
      moduleName,
      referenced,
      tree,
      uri,
      writeable,
    };

    if (existingTree === -1) {
      this.treeIndex.push(treeContainer);
    } else {
      this.treeIndex[existingTree] = treeContainer;
    }
  }

  public removeTree(uri: string): void {
    // Not sure this is the best way to do this...
    this.treeIndex = this.treeIndex.filter(tree => tree.uri !== uri);
  }
}
