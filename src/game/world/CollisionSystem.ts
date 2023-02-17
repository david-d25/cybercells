import KdTree, {Axis, Node} from "@/geom/KdTree";
import {HasAabb} from "@/geom/HasAabb";
import Aabb from "@/geom/Aabb";
import World from "@/game/world/World";

export default class CollisionSystem<T extends HasAabb> {

    private tree: KdTree<T> = new KdTree();

    buildSystem(world: World, objects: Iterable<T>) {
        const objectsSet = new Set<T>();
        for (const object of objects)
            objectsSet.add(object);

        this.tree.root = new Node(Axis.X, [0, 0, world.width, world.height], objectsSet);
        this.buildNodes(this.tree.root, Math.floor(Math.sqrt(objectsSet.size)));
    }

    add(object: T) {
        // TODO
    }

    remove(object: T) {
        // TODO
    }

    findPotentialCollisions(aabb: Aabb): Iterable<T> {
        const result = new Set<T>();

        if (this.tree.root == null)
            return result;

        const candidateNodes: Node<T>[] = [this.tree.root];
        while (candidateNodes.length != 0) {
            const node = candidateNodes.pop()!;
            if (node.childA == null || node.childB == null) {
                for (const object of node.objects)
                    result.add(object);
            } else {
                const middle = node.splitLine;
                const [ minX, minY, maxX, maxY ] = aabb;
                if (node.axis == Axis.X) {
                    if (minX <= middle)
                        candidateNodes.push(node.childA!);
                    if (maxX >= middle)
                        candidateNodes.push(node.childB!);
                } else {
                    if (minY <= middle)
                        candidateNodes.push(node.childA!);
                    if (maxY >= middle)
                        candidateNodes.push(node.childB!);
                }
            }
        }

        return result;
    }

    private buildNodes(node: Node<T>, depthRemaining: number) {
        let middle = 0;
        let count = 0;
        const isAxisX = node.axis == Axis.X
        if (isAxisX) {
            for (const object of node.objects) {
                middle += object.aabb[0];
                count++;
            }
        } else {
            for (const object of node.objects) {
                middle += object.aabb[1];
                count++;
            }
        }
        middle /= count;

        if (count <= 2 || depthRemaining <= 0)
            return;

        const [ minX, minY, maxX, maxY ] = node.aabb;

        const objectsA = new Set<T>();
        const objectsB = new Set<T>();
        const aabbA: Aabb = [
            minX, minY,
            isAxisX ? middle : maxX,
            isAxisX ? maxY : middle
        ];
        const aabbB: Aabb = [
            isAxisX ? middle : minX,
            isAxisX ? minY : middle,
            maxX, maxY
        ];
        if (isAxisX) {
            for (const object of node.objects) {
                if (object.aabb[0] <= middle)
                    objectsA.add(object);
                if (object.aabb[2] >= middle)
                    objectsB.add(object);
            }
        } else {
            for (const object of node.objects) {
                if (object.aabb[1] <= middle)
                    objectsA.add(object);
                if (object.aabb[3] >= middle)
                    objectsB.add(object);
            }
        }
        node.splitLine = middle;
        const newAxis = isAxisX ? Axis.Y : Axis.X;
        const nodeA = new Node<T>(newAxis, aabbA, objectsA);
        const nodeB = new Node<T>(newAxis, aabbB, objectsB);
        this.buildNodes(nodeA, depthRemaining - 1);
        this.buildNodes(nodeB, depthRemaining - 1);
    }
}