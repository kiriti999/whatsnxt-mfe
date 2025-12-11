'use client';

import React, { useState } from 'react';
import DiagramEditor from './DiagramEditor';
import { Button, Container, Title, Group, Badge, Text, Card, TextInput, ActionIcon, Stack, Divider, Select } from '@mantine/core';
import { jumbleGraph, validateGraph } from '../../utils/lab-utils';

interface ArchitectureLabClientProps {
    labId?: string;
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
    type: 'text' | 'count'; // simplified for now
    correctAnswer?: string;
}

type LabStatus = 'DRAFT' | 'PUBLISHED';

const ArchitectureLabClient: React.FC<ArchitectureLabClientProps> = ({ labId, initialData }) => {
    const [mode, setMode] = useState<'instructor' | 'student'>('instructor');
    const [currentGraph, setCurrentGraph] = useState<any>(initialData?.masterGraph || null);
    const [title, setTitle] = useState(initialData?.title || 'New Architecture Lab');
    const [status, setStatus] = useState<LabStatus>(initialData?.status || 'DRAFT');
    const [questions, setQuestions] = useState<LabQuestion[]>(initialData?.questions || []);
    const [validationResult, setValidationResult] = useState<any>(null);

    // Question Management
    const addQuestion = () => {
        const newQ: LabQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            type: 'text'
        };
        setQuestions([...questions, newQ]);
    };

    const updateQuestion = (id: string, field: keyof LabQuestion, value: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    // Instructor Actions
    const handleSave = async (newStatus: LabStatus = status) => {
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
                ? `${process.env.NEXT_PUBLIC_BFF_HOST_COMMON_API || 'http://localhost:4444'}/api/v1/lab/labs/${labId}`
                : `${process.env.NEXT_PUBLIC_BFF_HOST_COMMON_API || 'http://localhost:4444'}/api/v1/lab/labs`;

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
            const endpoint = `${process.env.NEXT_PUBLIC_BFF_HOST_COMMON_API || 'http://localhost:4444'}/api/v1/lab/labs/${labId}`;
            await fetch(endpoint, { method: 'DELETE' });
            alert('Lab deleted');
            // Navigate back
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // Student Actions
    const handleStartLab = () => {
        // Switch to student mode and jumble
        if (!currentGraph) return;
        const jumbled = jumbleGraph(currentGraph);
        setCurrentGraph(jumbled);
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
                    <Button variant="outline" onClick={() => setMode('instructor')}>Instructor</Button>
                    <Button variant="outline" onClick={() => setMode('student')}>Student</Button>
                </Group>
            </Group>

            {mode === 'instructor' ? (
                <>
                    <DiagramEditor
                        mode="instructor"
                        onGraphChange={setCurrentGraph}
                        initialGraph={currentGraph}
                    />
                    <Card withBorder mt="md" p="md">
                        <Group justify="space-between" mb="sm">
                            <Text fw={600}>Lab Questions</Text>
                            <Button size="xs" variant="light" onClick={addQuestion}>+ Add Question</Button>
                        </Group>
                        <Stack gap="sm">
                            {questions.map((q, index) => (
                                <Group key={q.id} align="flex-start">
                                    <Text fw={500} mt={8} style={{ width: 20 }}>{index + 1}.</Text>
                                    <TextInput
                                        placeholder="Question text"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, 'text', e.currentTarget.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <Select
                                        data={[{ value: 'text', label: 'Text Answer' }, { value: 'count', label: 'Count Elements' }]}
                                        value={q.type}
                                        onChange={(val) => updateQuestion(q.id, 'type', val || 'text')}
                                        w={150}
                                    />
                                    <Button color="red" variant="subtle" onClick={() => deleteQuestion(q.id)}>X</Button>
                                </Group>
                            ))}
                            {questions.length === 0 && <Text c="dimmed" fs="italic" size="sm">No questions added yet.</Text>}
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
                        mode="student"
                        onGraphChange={setCurrentGraph}
                        initialGraph={currentGraph}
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
