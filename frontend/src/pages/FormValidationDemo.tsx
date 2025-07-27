import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { useFormFeedback } from '../hooks/useFormFeedback';
import { useDestructiveAction } from '../hooks/useDestructiveAction';
import { validationSchemas } from '../utils/validation';
// import { ValidatedForm, FormField } from '../components/forms';

interface DemoFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const FormValidationDemo: React.FC = () => {
  const [formData, setFormData] = useState<DemoFormData | null>(null);
  const [loading, setLoading] = useState(false);

  const feedback = useFormFeedback({
    successTitle: 'Form Başarılı',
    successMessage: 'Form başarıyla gönderildi!',
  });

  const deleteAction = useDestructiveAction({
    title: 'Formu Temizle',
    description: 'Tüm form verilerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    confirmText: 'Evet, Temizle',
    cancelText: 'İptal',
    variant: 'danger',
    successMessage: 'Form verileri temizlendi',
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, touchedFields, isSubmitting },
  } = useForm<DemoFormData>({
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const handleFormSubmit = async (data: DemoFormData) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setFormData(data);
    setLoading(false);
    feedback.showSuccess('Form başarıyla gönderildi!');
  };

  const handleClearForm = async () => {
    await deleteAction.execute(() => {
      reset();
      setFormData(null);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Form Validation Demo
          </h1>
          <p className="text-gray-600">
            Bu sayfa gelişmiş form doğrulama özelliklerini gösterir
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Kayıt Formu</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
                <Input
                  label="Kullanıcı Adı"
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  error={errors.username?.message}
                  state={errors.username ? 'error' : touchedFields.username && !errors.username ? 'success' : 'default'}
                  showValidationIcon={true}
                  realTimeValidation={true}
                  helperText="3-50 karakter, sadece harf, rakam ve alt çizgi"
                  required
                  {...register('username', validationSchemas.register.username)}
                />

                <Input
                  label="E-posta"
                  type="email"
                  placeholder="E-posta adresinizi girin"
                  error={errors.email?.message}
                  state={errors.email ? 'error' : touchedFields.email && !errors.email ? 'success' : 'default'}
                  showValidationIcon={true}
                  realTimeValidation={true}
                  helperText="Geçerli bir e-posta adresi girin"
                  required
                  {...register('email', validationSchemas.register.email)}
                />

                <Input
                  label="Şifre"
                  type="password"
                  placeholder="Şifrenizi girin"
                  error={errors.password?.message}
                  state={errors.password ? 'error' : touchedFields.password && !errors.password ? 'success' : 'default'}
                  showValidationIcon={true}
                  realTimeValidation={true}
                  helperText="En az 8 karakter, büyük harf, küçük harf ve rakam içermeli"
                  required
                  {...register('password', validationSchemas.register.password)}
                />

                <Input
                  label="Şifre Onayı"
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  error={errors.confirmPassword?.message}
                  state={errors.confirmPassword ? 'error' : touchedFields.confirmPassword && !errors.confirmPassword ? 'success' : 'default'}
                  showValidationIcon={true}
                  realTimeValidation={true}
                  helperText="Yukarıdaki şifre ile aynı olmalı"
                  required
                  {...register('confirmPassword', validationSchemas.register.confirmPassword(password))}
                />

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading || isSubmitting}
                    disabled={!isValid || loading || isSubmitting}
                    className="flex-1"
                  >
                    {loading || isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearForm}
                    loading={deleteAction.isLoading}
                    disabled={loading || isSubmitting || deleteAction.isLoading}
                  >
                    Temizle
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Form Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Doğrulama Durumu</h3>
                  <div className="text-sm">
                    <p className={`${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      Form {isValid ? 'geçerli' : 'geçersiz'}
                    </p>
                    <p className="text-gray-600">
                      Hata sayısı: {Object.keys(errors).length}
                    </p>
                    <p className="text-gray-600">
                      Dokunulan alan sayısı: {Object.keys(touchedFields).length}
                    </p>
                  </div>
                </div>

                {Object.keys(errors).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-red-700 mb-2">Hatalar</h3>
                    <ul className="text-sm text-red-600 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>
                          <strong>{field}:</strong> {error?.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {formData && (
                  <div>
                    <h3 className="text-sm font-medium text-green-700 mb-2">Gönderilen Veri</h3>
                    <pre className="text-xs bg-green-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Özellikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Gerçek Zamanlı Doğrulama</h3>
                <p className="text-sm text-gray-600">
                  Form alanları yazılırken anlık olarak doğrulanır ve görsel geri bildirim sağlanır.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Görsel Geri Bildirim</h3>
                <p className="text-sm text-gray-600">
                  Başarılı, hatalı ve uyarı durumları için farklı renkler ve ikonlar kullanılır.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Toast Bildirimleri</h3>
                <p className="text-sm text-gray-600">
                  Başarılı işlemler ve hatalar için otomatik toast bildirimleri gösterilir.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Onay Diyalogları</h3>
                <p className="text-sm text-gray-600">
                  Yıkıcı işlemler için kullanıcıdan onay alınır ve güvenli bir deneyim sağlanır.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Kapsamlı Doğrulama</h3>
                <p className="text-sm text-gray-600">
                  E-posta, şifre, kullanıcı adı gibi alanlar için özel doğrulama kuralları.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Yükleme Durumları</h3>
                <p className="text-sm text-gray-600">
                  Form gönderimi sırasında butonlar devre dışı bırakılır ve yükleme gösterilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormValidationDemo;