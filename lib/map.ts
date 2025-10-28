// Определяем интерфейсы для типов
interface GraphPoint {
    id: string;
    nearPoints: string[];
    x: number;
    y: number;
}

interface PathResult {
    path: GraphPoint[];
    pathIds: string[];
    distance: number;
}

interface MandatoryPathResult extends PathResult {
    order: GraphPoint[];
    orderIds: string[];
}

// Функция расчета расстояния между двумя точками
function calculateDistance(point1: GraphPoint, point2: GraphPoint): number {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

// Функция поиска кратчайшего пути между двумя точками
function findShortestPathBetweenTwoPoints(graph: GraphPoint[], startId: string, endId: string): PathResult | null {
    const nodes = new Map<string, GraphPoint>();
    graph.forEach(node => nodes.set(node.id, node));

    if (!nodes.has(startId) || !nodes.has(endId)) return null;

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const visited = new Set<string>();
    const unvisited = new Set<string>();

    graph.forEach(node => {
        distances.set(node.id, Infinity);
        previous.set(node.id, null);
        unvisited.add(node.id);
    });

    distances.set(startId, 0);

    while (unvisited.size > 0) {
        let currentId: string | null = null;
        let minDistance = Infinity;

        for (const nodeId of unvisited) {
            const distance = distances.get(nodeId)!;
            if (distance < minDistance) {
                minDistance = distance;
                currentId = nodeId;
            }
        }

        if (currentId === null || currentId === endId) break;

        unvisited.delete(currentId);
        visited.add(currentId);

        const currentNode = nodes.get(currentId)!;
        const currentDistance = distances.get(currentId)!;

        for (const neighborId of currentNode.nearPoints) {
            if (visited.has(neighborId)) continue;

            const neighborNode = nodes.get(neighborId);
            if (!neighborNode) continue;

            const distanceToNeighbor = calculateDistance(currentNode, neighborNode);
            const totalDistance = currentDistance + distanceToNeighbor;

            const neighborDistance = distances.get(neighborId)!;
            if (totalDistance < neighborDistance) {
                distances.set(neighborId, totalDistance);
                previous.set(neighborId, currentId);
            }
        }
    }

    const pathIds: string[] = [];
    let currentId: string | null = endId;

    while (currentId !== null) {
        pathIds.unshift(currentId);
        currentId = previous.get(currentId)!;
    }

    if (pathIds[0] !== startId) return null;

    // Преобразуем ID в полные объекты точек
    const pathObjects = pathIds.map(id => nodes.get(id)!);

    return {
        path: pathObjects,
        pathIds: pathIds,
        distance: distances.get(endId)!
    };
}

// Функция поиска пути с обязательными точками
export function findShortestPathWithMandatoryPoints(graph: GraphPoint[], mandatoryPoints: string[]): MandatoryPathResult | null {
    if (mandatoryPoints.length < 2) {
        throw new Error("Должно быть как минимум 2 обязательные точки");
    }

    const nodes = new Map<string, GraphPoint>();
    graph.forEach(node => nodes.set(node.id, node));

    // Проверяем, что все обязательные точки существуют
    for (const pointId of mandatoryPoints) {
        if (!nodes.has(pointId)) {
            throw new Error(`Точка '${pointId}' не найдена в графе`);
        }
    }

    // Если только 2 точки, просто находим путь между ними
    if (mandatoryPoints.length === 2) {
        const result = findShortestPathBetweenTwoPoints(graph, mandatoryPoints[0], mandatoryPoints[1]);
        if (!result) return null;
        
        return {
            ...result,
            order: [nodes.get(mandatoryPoints[0])!, nodes.get(mandatoryPoints[1])!],
            orderIds: mandatoryPoints
        };
    }
    
    // Находим все возможные перестановки промежуточных точек
    const startPoint = mandatoryPoints[0];
    const endPoint = mandatoryPoints[mandatoryPoints.length - 1];
    const intermediatePoints = mandatoryPoints.slice(1, -1);

    // Генерируем все возможные порядки посещения промежуточных точек
    function getPermutations(arr: string[]): string[][] {
        if (arr.length === 0) return [[]];
        const result: string[][] = [];
        for (let i = 0; i < arr.length; i++) {
            const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const permutations = getPermutations(rest);
            for (const perm of permutations) {
                result.push([arr[i], ...perm]);
            }
        }
        return result;
    }
    
    const permutations = getPermutations(intermediatePoints);
    let bestPath: MandatoryPathResult | null = null;
    let bestDistance = Infinity;
    
    // Для каждой перестановки находим полный путь
    for (const permutation of permutations) {
        const fullOrder = [startPoint, ...permutation, endPoint];
        let currentPath: GraphPoint[] = [];
        let totalDistance = 0;
        let isValid = true;
        
        // Собираем путь из сегментов между последовательными точками
        for (let i = 0; i < fullOrder.length - 1; i++) {
            const segment = findShortestPathBetweenTwoPoints(graph, fullOrder[i], fullOrder[i + 1]);

            if (!segment) {
                isValid = false;
                break;
            }
            
            // Добавляем сегмент пути (кроме последней точки, чтобы избежать дублирования)
            const segmentPath = (i === 0) ? segment.path : segment.path.slice(1);
            currentPath = [...currentPath, ...segmentPath];
            totalDistance += segment.distance;
        }
        
        if (isValid && totalDistance < bestDistance) {
            bestDistance = totalDistance;
            bestPath = {
                path: currentPath,
                pathIds: currentPath.map(point => point.id),
                distance: totalDistance,
                order: fullOrder.map(id => nodes.get(id)!),
                orderIds: fullOrder
            };
        }
    }
    
    return bestPath;
}
