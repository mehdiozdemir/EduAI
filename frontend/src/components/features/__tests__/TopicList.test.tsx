import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicList } from '../TopicList';
import type { Topic } from '../../../types/subject';

const mockTopics: Topic[] = [
  {
    id: 1,
    subject_id: 1,
    name: 'Algebra',
    description: 'Basic algebra concepts',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    subject_id: 1,
    name: 'Geometry',
    description: 'Basic geometry concepts',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    subject_id: 1,
    name: 'Calculus',
    description: 'Advanced calculus concepts',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('TopicList', () => {
  it('should render all topics', () => {
    const onTopicSelect = vi.fn();

    render(<TopicList topics={mockTopics} onTopicSelect={onTopicSelect} />);

    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Geometry')).toBeInTheDocument();
    expect(screen.getByText('Calculus')).toBeInTheDocument();
  });

  it('should render topic descriptions', () => {
    const onTopicSelect = vi.fn();

    render(<TopicList topics={mockTopics} onTopicSelect={onTopicSelect} />);

    expect(screen.getByText('Basic algebra concepts')).toBeInTheDocument();
    expect(screen.getByText('Basic geometry concepts')).toBeInTheDocument();
    expect(screen.getByText('Advanced calculus concepts')).toBeInTheDocument();
  });

  it('should call onTopicSelect when topic card is clicked', () => {
    const onTopicSelect = vi.fn();

    render(<TopicList topics={mockTopics} onTopicSelect={onTopicSelect} />);

    // Click on the card (not just the text)
    const algebraCard = screen.getByText('Algebra').closest('.cursor-pointer');
    fireEvent.click(algebraCard!);

    expect(onTopicSelect).toHaveBeenCalledWith(1);
  });

  it('should show loading state', () => {
    const onTopicSelect = vi.fn();

    render(
      <TopicList topics={[]} onTopicSelect={onTopicSelect} loading={true} />
    );

    // The component shows a Loading component when loading is true
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show empty state when no topics', () => {
    const onTopicSelect = vi.fn();

    render(
      <TopicList topics={[]} onTopicSelect={onTopicSelect} loading={false} />
    );

    expect(screen.getByText('Henüz konu bulunmuyor')).toBeInTheDocument();
    expect(screen.getByText('Bu ders için henüz konu eklenmemiş.')).toBeInTheDocument();
  });

  it('should render topic cards with select buttons', () => {
    const onTopicSelect = vi.fn();

    render(<TopicList topics={mockTopics} onTopicSelect={onTopicSelect} />);

    // Should have select buttons for each topic
    const selectButtons = screen.getAllByText('Seç');
    expect(selectButtons).toHaveLength(3);
  });

  it('should call onTopicSelect when select button is clicked', () => {
    const onTopicSelect = vi.fn();

    render(<TopicList topics={mockTopics} onTopicSelect={onTopicSelect} />);

    const selectButtons = screen.getAllByText('Seç');
    fireEvent.click(selectButtons[0]);

    expect(onTopicSelect).toHaveBeenCalledWith(1);
  });

  it('should show creation date for each topic', () => {
    const onTopicSelect = vi.fn();

    render(<TopicList topics={mockTopics} onTopicSelect={onTopicSelect} />);

    // Should show formatted creation dates
    const creationDates = screen.getAllByText(/Oluşturulma:/);
    expect(creationDates).toHaveLength(3);
  });

  it('should have hover effects on cards', () => {
    const onTopicSelect = vi.fn();

    render(<TopicList topics={mockTopics} onTopicSelect={onTopicSelect} />);

    const algebraCard = screen.getByText('Algebra').closest('.cursor-pointer');
    expect(algebraCard).toHaveClass('hover:shadow-md', 'transition-shadow', 'cursor-pointer');
  });

  it('should prevent event bubbling when select button is clicked', () => {
    const onTopicSelect = vi.fn();

    render(<TopicList topics={mockTopics} onTopicSelect={onTopicSelect} />);

    const selectButton = screen.getAllByText('Seç')[0];
    fireEvent.click(selectButton);

    // Should only be called once (from button click, not card click)
    expect(onTopicSelect).toHaveBeenCalledTimes(1);
    expect(onTopicSelect).toHaveBeenCalledWith(1);
  });
});
