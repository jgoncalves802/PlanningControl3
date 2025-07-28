'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Upload, 
  Download, 
  Eye,
  GripVertical,
  Image as ImageIcon,
  File,
  Paperclip
} from 'lucide-react';

interface TechnicalTopic {
  id: string;
  title: string;
  content: string;
  order: number;
  isEditing?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

interface TechnicalProposalEditorProps {
  onSave: () => void;
  loading?: boolean;
}

export default function TechnicalProposalEditor({ onSave, loading = false }: TechnicalProposalEditorProps) {
  const [topics, setTopics] = useState<TechnicalTopic[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editingTopic, setEditingTopic] = useState<TechnicalTopic | null>(null);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);

  useEffect(() => {
    // Carregar dados salvos
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    // Simular dados salvos
    const savedTopics: TechnicalTopic[] = [
      {
        id: '1',
        title: 'Objetivo do Projeto',
        content: 'Este projeto tem como objetivo...',
        order: 1,
      },
      {
        id: '2',
        title: 'Escopo dos Serviços',
        content: 'O escopo inclui os seguintes serviços...',
        order: 2,
      },
    ];

    const savedAttachments: Attachment[] = [
      {
        id: '1',
        name: 'Especificações Técnicas',
        fileName: 'especificacoes.pdf',
        fileType: 'application/pdf',
        fileSize: 1024 * 1024 * 2, // 2MB
        uploadedAt: new Date(),
      },
    ];

    setTopics(savedTopics);
    setAttachments(savedAttachments);
  };

  const handleAddTopic = () => {
    if (!newTopic.title.trim()) return;

    const topic: TechnicalTopic = {
      id: Date.now().toString(),
      title: newTopic.title,
      content: newTopic.content,
      order: topics.length + 1,
    };

    setTopics([...topics, topic]);
    setNewTopic({ title: '', content: '' });
    setShowNewTopicForm(false);
  };

  const handleEditTopic = (topic: TechnicalTopic) => {
    setEditingTopic(topic);
  };

  const handleSaveTopic = () => {
    if (!editingTopic) return;

    setTopics(topics.map(t => 
      t.id === editingTopic.id ? editingTopic : t
    ));
    setEditingTopic(null);
  };

  const handleCancelEdit = () => {
    setEditingTopic(null);
  };

  const handleDeleteTopic = (topicId: string) => {
    setTopics(topics.filter(t => t.id !== topicId));
  };

  const handleMoveTopic = (topicId: string, direction: 'up' | 'down') => {
    const currentIndex = topics.findIndex(t => t.id === topicId);
    if (currentIndex === -1) return;

    const newTopics = [...topics];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newTopics.length) {
      [newTopics[currentIndex], newTopics[targetIndex]] = [newTopics[targetIndex], newTopics[currentIndex]];
      newTopics[currentIndex].order = currentIndex + 1;
      newTopics[targetIndex].order = targetIndex + 1;
      setTopics(newTopics);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date(),
      };

      setAttachments([...attachments, attachment]);
    });
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (fileType === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Tópicos da Proposta */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-blue-600" />
            Tópicos da Proposta Técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de Tópicos */}
          <div className="space-y-3">
            {topics.map((topic) => (
              <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                {editingTopic?.id === topic.id ? (
                  // Modo de edição
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <Input
                        value={editingTopic.title}
                        onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                        className="flex-1"
                        placeholder="Título do tópico"
                      />
                    </div>
                    <Textarea
                      value={editingTopic.content}
                      onChange={(e) => setEditingTopic({ ...editingTopic, content: e.target.value })}
                      rows={4}
                      placeholder="Conteúdo do tópico"
                      className="resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveTopic}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <h4 className="font-medium text-gray-900">{topic.title}</h4>
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          #{topic.order}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleMoveTopic(topic.id, 'up')}
                          variant="ghost"
                          size="sm"
                          disabled={topic.order === 1}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          ↑
                        </Button>
                        <Button
                          onClick={() => handleMoveTopic(topic.id, 'down')}
                          variant="ghost"
                          size="sm"
                          disabled={topic.order === topics.length}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          ↓
                        </Button>
                        <Button
                          onClick={() => handleEditTopic(topic)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteTopic(topic.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Adicionar Novo Tópico */}
          {showNewTopicForm ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                <Input
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  placeholder="Título do novo tópico"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Textarea
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  rows={3}
                  placeholder="Conteúdo do tópico"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setShowNewTopicForm(false)}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddTopic}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Tópico
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowNewTopicForm(true)}
              variant="outline"
              className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Novo Tópico
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Anexos */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Paperclip className="w-5 h-5 text-green-600" />
            Anexos da Proposta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de Arquivos */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Arquivos
            </label>
          </div>

          {/* Lista de Anexos */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Arquivos Anexados</h4>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        {getFileIcon(attachment.fileType)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(attachment.fileSize)} • 
                          {attachment.uploadedAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Eye className="w-4 h-4 mr-2" />
          Visualizar Proposta
        </Button>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
        <Button
          onClick={onSave}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Proposta
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 