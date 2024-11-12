import { Box, Alert, Button, Paper, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import NlognLogo from './NlognLogo';

const GameBoard = styled(Box)({
    width: '600px',
    height: '600px',
    margin: '0 auto',
    position: 'relative',
});

const GameContainer = styled(Box)({
    display: 'flex',
    gap: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
});

const RulesPanel = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    width: '300px',
    height: 'fit-content',
}));

interface Point {
    x: number;
    y: number;
    id: number;
}

// Добавим интерфейс для состояния хода
interface MoveState {
    isFirstPhase: boolean;
    selectedPointId: number | null;
}

const Game = () => {
    const centerX = 300;
    const centerY = 300;
    const outerRadius = 250;
    
    const [placedPieces, setPlacedPieces] = useState<number[]>([]);
    const [moveState, setMoveState] = useState<MoveState>({
        isFirstPhase: true,
        selectedPointId: null
    });

    const [showDialog, setShowDialog] = useState(false);

    // Обновляем проверку завершения игры
    useEffect(() => {
        if (placedPieces.length === 9 && !showDialog) {
            setShowDialog(true);
        }
    }, [placedPieces.length, showDialog]);

    const handleDialogClose = () => {
        setShowDialog(false);
        handleReset();
    };

    const navigateToNlogn = () => {
        window.open('https://nlogn.info', '_blank');
    };

    // Вычисляем координаты вершин пятиконечной звезды
    const calculateStarPoints = (): Point[] => {
        const points = [];
        
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72 - 18) * Math.PI / 180;
            const x = centerX + outerRadius * Math.cos(angle);
            const y = centerY + outerRadius * Math.sin(angle);
            points.push({ x, y, id: i });
        }
        
        return points;
    };

    // Вычисляем точки пересечения соседних линий
    const calculateIntersectionPoints = (): Point[] => {
        const points = [];
        const starPoints = calculateStarPoints();
        
        for (let i = 0; i < 5; i++) {
            const p1 = starPoints[i];
            const p2 = starPoints[(i + 2) % 5];
            const p3 = starPoints[(i + 1) % 5];
            const p4 = starPoints[(i + 3) % 5];
            
            const intersection = findIntersection(p1, p2, p3, p4);
            if (intersection) {
                points.push({ ...intersection, id: i + 5 });
            }
        }
        
        return points;
    };

    const findIntersection = (p1: Point, p2: Point, p3: Point, p4: Point) => {
        const x1 = p1.x, y1 = p1.y;
        const x2 = p2.x, y2 = p2.y;
        const x3 = p3.x, y3 = p3.y;
        const x4 = p4.x, y4 = p4.y;

        const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denominator === 0) return null;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    };

    const starPoints = calculateStarPoints();
    const intersectionPoints = calculateIntersectionPoints();
    const allPoints = [...starPoints, ...intersectionPoints];

    // Создаем линии звезды
    const createStarLines = () => {
        const lines = [];
        const pointCount = starPoints.length;
        
        for (let i = 0; i < pointCount; i++) {
            lines.push({
                x1: starPoints[i].x,
                y1: starPoints[i].y,
                x2: starPoints[(i + 2) % pointCount].x,
                y2: starPoints[(i + 2) % pointCount].y
            });
        }
        
        return lines;
    };

    // Обновленная функция проверки валидности хода с правильными линиями
    const isValidMove = (fromId: number, toId: number): boolean => {
        // Массив допустимых ходов через одну точку
        const validMoves = [
            [1, 6], // правая верхняя вершина <-> правая внутренняя
            [1, 8], // правая верхняя вершина <-> левая внутренняя
            [4, 6], // левая верхняя вершина <-> правая внутренняя
            [4, 9], // левая верхняя ершина <-> нижняя внутренняя
            [0, 7], // верхняя вершина <-> центр
            [0, 5], // верхняя вершина <-> верхняя внутренняя
            [2, 9], // правая нижняя вершина <-> нижняя внутренняя
            [2, 7], // правая нижняя вершина <-> центр
            [3, 8], // левая нижняя вершина <-> левая внутренняя
            [3, 5], // левая нижняя вершина <-> верхняя внутренняя
        ];

        // Проверяем, есть ли такой ход в списке допустимых (в обоих направлениях)
        return validMoves.some(([start, end]) => 
            (fromId === start && toId === end) || (fromId === end && toId === start)
        );
    };

    const handlePointClick = (pointId: number) => {
        // Если все фишки уже размещены, выходим
        if (placedPieces.length >= 9) return;
        
        // Если точка уже занята, выходим
        if (placedPieces.includes(pointId)) return;

        if (moveState.isFirstPhase) {
            // Первая фаза: выбор первой точки
            setMoveState({
                isFirstPhase: false,
                selectedPointId: pointId
            });
        } else {
            // Вторая фаза: выбор второй точки
            const fromId = moveState.selectedPointId;
            if (fromId === null) return;

            // Проверяем валидность хода
            if (isValidMove(fromId, pointId)) {
                // Размещаем фишку на второй точке
                setPlacedPieces([...placedPieces, pointId]);
                setMoveState({
                    isFirstPhase: true,
                    selectedPointId: null
                });
            } else {
                // Если ход невалиден, сбрасываем выбор
                setMoveState({
                    isFirstPhase: true,
                    selectedPointId: null
                });
            }
        }
    };

    const handleReset = () => {
        setPlacedPieces([]);
        setMoveState({
            isFirstPhase: true,
            selectedPointId: null
        });
        setShowDialog(false);
    };

    const starLines = createStarLines();
    const isGameComplete = placedPieces.length === 9;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h3" align="center" gutterBottom>
                Пентальфа
            </Typography>
            
            <GameContainer>
                <Box>
                    {isGameComplete && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Поздравляем! Вы победили!
                        </Alert>
                    )}
                    <GameBoard>
                        <svg width="600" height="600">
                            {starLines.map((line, index) => (
                                <line
                                    key={index}
                                    x1={line.x1}
                                    y1={line.y1}
                                    x2={line.x2}
                                    y2={line.y2}
                                    stroke="black"
                                    strokeWidth="2"
                                />
                            ))}
                            
                            {allPoints.map((point) => (
                                <g key={point.id} onClick={() => handlePointClick(point.id)}>
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="5"
                                        fill="black"
                                    />
                                    {placedPieces.includes(point.id) && (
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="15"
                                            fill="#2196f3"
                                            stroke="white"
                                            strokeWidth="2"
                                        />
                                    )}
                                    {moveState.selectedPointId === point.id && (
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="15"
                                            fill="rgba(33, 150, 243, 0.5)"
                                            stroke="#2196f3"
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                        >
                                            <animate
                                                attributeName="stroke-dashoffset"
                                                from="0"
                                                to="10"
                                                dur="1s"
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    )}
                                </g>
                            ))}
                        </svg>
                        
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            {!isGameComplete ? (
                                moveState.isFirstPhase ? 
                                    `Выберите первую точку хода (осталось фишек: ${9 - placedPieces.length})` :
                                    'Выберите вторую точку хода (должна быть через одну точку по линии)'
                            ) : (
                                'Игра завершена!'
                            )}
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleReset}
                                sx={{ mt: 2, display: 'block', margin: '20px auto' }}
                            >
                                Сбросить игру
                            </Button>
                        </Box>
                    </GameBoard>
                </Box>

                <RulesPanel elevation={3}>
                    <Typography variant="h5" gutterBottom>
                        Правила игры
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Пентальфа - это логическая игра-головоломка на пятиконечной звезде.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Цель игры: разместить все 9 фишек на поле по определенным правилам.
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Как играть:
                    </Typography>
                    <Typography component="div">
                        <ul>
                            <li>За один ход нужно выбрать две пустые точки</li>
                            <li>Точки должны быть соединены линией на поле</li>
                            <li>Между выбранными точками должна быть ровно одна точка (занятая или пустая)</li>
                            <li>После хода фишка появляется во второй выбранной точке</li>
                            <li>Игра завершается, когда все 9 фишек размещены на поле</li>
                        </ul>
                    </Typography>
                    <Divider sx={{ my: 3 }} />
                    <NlognLogo />
                </RulesPanel>
            </GameContainer>

            {/* Диалоговое окно после победы */}
            <Dialog
                open={showDialog}
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Поздравляем с победой!
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        Понравилась эта игра? В школе NlogN мы регулярно решаем похожие интересные задачи!
                    </Typography>
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                        <NlognLogo />
                    </Box>
                    <Typography variant="body1">
                        Присоединяйтесь к нам и развивайте свои навыки решения логических задач!
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Закрыть
                    </Button>
                    <Button 
                        onClick={navigateToNlogn} 
                        variant="contained" 
                        color="primary"
                    >
                        Перейти на сайт школы
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Game;