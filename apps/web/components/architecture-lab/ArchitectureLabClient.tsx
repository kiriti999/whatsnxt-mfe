'use client';

import React, { useState } from 'react';
import DiagramEditor from './DiagramEditor';
import { Button, Container, Title, Group, Badge, Text, Card, TextInput, ActionIcon, Stack, Divider, Select, Paper, Switch, NumberInput } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { jumbleGraph, validateGraph } from '../../utils/lab-utils';
import useAuth from '../../hooks/Authentication/useAuth';

interface ArchitectureLabClientProps {
    labId?: string;
    initialMode?: 'instructor' | 'student';
    labCreatorId?: string;
    initialData?: {
        masterGraph?: any;
        title?: string;
        questions?: LabQuestion[];
        status?: LabStatus;
        _id?: string;
    };
}

interface LabQuestion {
    id: string;
    text: string;
    type: string; // 'text' | 'multiple-choice' | 'coding'
    correctAnswer?: string;
    options?: string[]; // For multiple choice
}

type LabStatus = 'DRAFT' | 'PUBLISHED';

const ArchitectureLabClient: React.FC<ArchitectureLabClientProps> = ({ labId, initialData, initialMode = 'instructor', labCreatorId }) => {
    const { user, loading: authLoading } = useAuth();
    const [mode, setMode] = useState<'instructor' | 'student'>(initialMode);

    // currentGraph tracks current STATE (for saving/validation)
    const [currentGraph, setCurrentGraph] = useState<any>(initialData?.masterGraph || null);

    // editorViewGraph tracks what we seed the editor with. 
    // We initializing this independently.
    const [editorViewGraph, setEditorViewGraph] = useState<any>(
        initialMode === 'student' && initialData?.masterGraph
            ? jumbleGraph(initialData.masterGraph)
            : initialData?.masterGraph || null
    );

    // If user is the creator, force instructor mode (unless exploring student view explicitly?)
    React.useEffect(() => {
        if (!authLoading && user && labCreatorId && user._id === labCreatorId) {
            setMode('instructor');
            // Seeding master graph to view
            setEditorViewGraph(initialData?.masterGraph);
            setCurrentGraph(initialData?.masterGraph);
        }
    }, [user, authLoading, labCreatorId, initialData]);

    const [title, setTitle] = useState(initialData?.title || 'New Architecture Lab');
    const [status, setStatus] = useState<LabStatus>(initialData?.status || 'DRAFT');
    const [questions, setQuestions] = useState<LabQuestion[]>(initialData?.questions || []);
    const [validationResult, setValidationResult] = useState<any>(null);

    // ... (rest of question management)

    const addQuestion = () => {
        const newQ: LabQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            type: 'multiple-choice',
            options: []
        };
        setQuestions([...questions, newQ]);
    };

    const updateQuestion = (id: string, field: keyof LabQuestion, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    // Instructor Actions
    const handleSave = async (newStatus: LabStatus = status) => {
        // ... (save logic uses currentGraph)
        if (!currentGraph) return;

        try {
            const payload = {
                title,
                description: 'Architecture Lab',
                type: 'architecture',
                masterGraph: currentGraph,
                difficulty: 'Medium',
                questions,
                status: newStatus
            };

            const endpoint = labId
                ? `/api/lab/${labId}`
                : `/api/lab/create`;

            const method = labId ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Pending Auth integration
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                setStatus(newStatus);
                alert(`Lab ${newStatus === 'PUBLISHED' ? 'published' : 'saved'} successfully!`);
                if (!labId && result.data._id) {
                    console.log('Created Lab ID:', result.data._id);
                    // ideally navigate to edit page
                }
            } else {
                alert('Failed to save lab: ' + result.message);
            }

        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving lab');
        }
    };

    const handleDelete = async () => {
        if (!labId || !confirm('Are you sure you want to delete this lab?')) return;
        try {
            const endpoint = `/api/lab/${labId}`;
            await fetch(endpoint, { method: 'DELETE' });
            alert('Lab deleted');
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // Student Actions
    const handleStartLab = () => {
        // Switch to student mode and jumble
        // We use currentGraph because maybe they added stuff before clicking test
        if (!currentGraph) return;
        const jumbled = jumbleGraph(currentGraph);
        setEditorViewGraph(jumbled); // Update the VIEW for the editor
        setCurrentGraph(jumbled);    // Update our TRACKING state
        setMode('student');
        setValidationResult(null);
    };

    const handleSubmit = () => {
        if (!currentGraph || !initialData?.masterGraph) {
            alert('Cannot validate without master graph. Please save first or ensure master graph is loaded.');
            return;
        }

        const result = validateGraph(initialData.masterGraph, currentGraph);
        setValidationResult(result);
    };

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="lg">
                <div>
                    <Group mb={5}>
                        {mode === 'instructor' ? (
                            <TextInput
                                value={title}
                                onChange={(e) => setTitle(e.currentTarget.value)}
                                size="md"
                                styles={{ input: { fontSize: 24, fontWeight: 700, height: 'auto', padding: 0, border: 'none', background: 'transparent' } }}
                                placeholder="Untitled Lab"
                            />
                        ) : (
                            <Title order={2}>{title}</Title>
                        )}
                        <Badge color={status === 'PUBLISHED' ? 'green' : 'gray'}>{status}</Badge>
                    </Group>
                    <Text c="dimmed">{mode === 'instructor' ? 'Design Mode' : 'Student Lab Mode'}</Text>
                </div>
                <Group>
                    {mode === 'instructor' && (
                        <>
                            <Button variant="default" onClick={() => handleSave('DRAFT')}>Save Draft</Button>
                            {status === 'DRAFT' ? (
                                <Button color="green" onClick={() => handleSave('PUBLISHED')}>Publish</Button>
                            ) : (
                                <Button color="orange" variant="light" onClick={() => handleSave('DRAFT')}>Unpublish</Button>
                            )}
                            <Divider orientation="vertical" mx="xs" />
                        </>
                    )}
                    {initialMode !== 'student' && (
                        <>
                            <Button variant="outline" onClick={() => setMode('instructor')}>Instructor</Button>
                            <Button variant="outline" onClick={() => setMode('student')}>Student</Button>
                        </>
                    )}
                </Group>
            </Group>

            {mode === 'instructor' ? (
                <>
                    <DiagramEditor
                        key="instructor-editor"
                        mode="instructor"
                        onGraphChange={setCurrentGraph}
                        initialGraph={editorViewGraph}
                    />
                    <Card withBorder mt="md" p="md">
                        <Divider my="sm" label="Questions" labelPosition="center" />
                        <Stack gap="sm">
                            {questions.map((q, index) => (
                                <Paper key={q.id} withBorder p="md" pos="relative">
                                    <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        pos="absolute"
                                        top={10}
                                        right={10}
                                        onClick={() => deleteQuestion(q.id)}
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>

                                    <Stack gap="sm">
                                        <TextInput
                                            label={
                                                <Group gap={4}>
                                                    <Text span>Question {index + 1}</Text>
                                                    <Text span c="red">*</Text>
                                                </Group>
                                            }
                                            placeholder="Enter question text"
                                            value={q.text}
                                            onChange={(e) => updateQuestion(q.id, 'text', e.currentTarget.value)}
                                        />

                                        <Select
                                            label="Question Type"
                                            data={[
                                                { value: 'multiple-choice', label: 'Multiple Choice' },
                                                { value: 'text', label: 'Text Answer' },
                                                { value: 'count', label: 'Count Elements' }
                                            ]}
                                            value={q.type}
                                            onChange={(val) => updateQuestion(q.id, 'type', val || 'text')}
                                        />

                                        {(q.type === 'multiple-choice') && (
                                            <TextInput
                                                label="Options (comma separated)"
                                                placeholder="Option 1, Option 2, Option 3"
                                                description="Enter options separated by commas"
                                                value={q.options ? q.options.join(', ') : ''}
                                                onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                            />
                                        )}

                                        <TextInput
                                            label="Correct Answer / Solution"
                                            placeholder="Enter correct answer"
                                            value={q.correctAnswer || ''}
                                            onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.currentTarget.value)}
                                        />
                                    </Stack>
                                </Paper>
                            ))}
                            {questions.length === 0 && <Text c="dimmed" fs="italic" size="sm" ta="center">No questions added yet.</Text>}

                            <Button
                                variant="outline"
                                leftSection={<IconPlus size={16} />}
                                onClick={addQuestion}
                                fullWidth
                                mt="sm"
                            >
                                Add Question
                            </Button>

                            <Divider my="sm" label="Practice Test Configuration" labelPosition="center" />
                            <Switch label="Enable Practice Test" />
                        </Stack>
                    </Card>

                    <Group mt="md" justify="space-between">
                        {labId && <Button color="red" variant="subtle" onClick={handleDelete}>Delete Lab</Button>}
                        <Group>
                            <Button onClick={handleStartLab}>Test as Student</Button>
                        </Group>
                    </Group>
                </>
            ) : (
                <>
                    <DiagramEditor
                        key="student-editor"
                        mode="student"
                        onGraphChange={setCurrentGraph}
                        initialGraph={editorViewGraph}
                    />
                    <Group mt="md" justify="flex-end">
                        <Button color="blue" onClick={handleSubmit}>Validate Solution</Button>
                    </Group>
                    {validationResult && (
                        <Card mt="md" withBorder>
                            <Text fw={700} c={validationResult.passed ? 'green' : 'red'}>
                                {validationResult.passed ? 'Passed!' : 'Try Again'}
                            </Text>
                            <Text>{validationResult.details}</Text>
                        </Card>
                    )}
                </>
            )}
        </Container>
    );
};

export default ArchitectureLabClient;
