const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Пользовательское соглашение</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700 leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="text-sm text-gray-700 space-y-3">
          <p>
            Добро пожаловать в «Счётный двор» — обучающий сервис для детей. Перед
            регистрацией, пожалуйста, внимательно ознакомьтесь с условиями.
          </p>

          <h3 className="font-semibold text-gray-900">1. Цель сервиса</h3>
          <p>
            Сервис предназначен для обучения математике и русскому языку детей
            младшего школьного возраста. Все задания носят образовательный характер.
          </p>

          <h3 className="font-semibold text-gray-900">2. Данные пользователя</h3>
          <p>
            Для работы сервиса мы сохраняем только минимально необходимую информацию:
            логин, имя (display name) и аватар. Почта, телефон и другие контактные
            данные не собираются. Мы не передаём данные третьим лицам.
          </p>

          <h3 className="font-semibold text-gray-900">3. Дети и родители</h3>
          <p>
            Для использования сервиса детям младше 13 лет требуется согласие
            родителя или законного представителя. Родитель может запросить удаление
            аккаунта и всех связанных данных.
          </p>

          <h3 className="font-semibold text-gray-900">4. Правила поведения</h3>
          <p>
            Запрещено использовать сервис для рассылки спама, оскорблений, попыток
            взлома и других действий, нарушающих работу сервиса.
          </p>

          <h3 className="font-semibold text-gray-900">5. Удаление данных</h3>
          <p>
            Пользователь может запросить удаление аккаунта и всех связанных данных
            через родителя/законного представителя. Данные будут удалены в разумный
            срок.
          </p>

          <h3 className="font-semibold text-gray-900">6. Изменения</h3>
          <p>
            Условия могут быть изменены. Продолжая пользоваться сервисом, вы
            соглашаетесь с актуальной версией соглашения.
          </p>

          <p className="text-xs text-gray-500 pt-2">
            Нажимая «Зарегистрироваться», вы подтверждаете, что прочитали и
            принимаете данные условия.
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full mt-5"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default TermsModal;
