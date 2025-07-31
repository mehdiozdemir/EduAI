# Requirements Document

## Introduction

Bu özellik, subjects sayfasında kullanıcıların önce eğitim seviyesini (İlkokul, Ortaokul, Lise) seçmelerini ve ardından seçilen seviyeye uygun derslerin listelenmesini sağlar. Bu sayede kullanıcılar kendi eğitim seviyelerine uygun içeriklere daha kolay erişebilirler.

## Requirements

### Requirement 1

**User Story:** As a student, I want to select my education level first when I visit the subjects page, so that I can see only the subjects relevant to my grade level.

#### Acceptance Criteria

1. WHEN I first visit the subjects page THEN the system SHALL display three education level selection boxes (İlkokul, Ortaokul, Lise)
2. WHEN I click on an education level box THEN the system SHALL highlight the selected level and show subjects for that level
3. IF no education level is selected THEN the system SHALL NOT display any subject list

### Requirement 2

**User Story:** As a student, I want to see subjects filtered by my selected education level, so that I don't get confused with subjects from other grade levels.

#### Acceptance Criteria

1. WHEN I select "İlkokul" THEN the system SHALL display primary school subjects (Matematik, Türkçe, Fen Bilimleri, Sosyal Bilgiler, İngilizce)
2. WHEN I select "Ortaokul" THEN the system SHALL display middle school subjects (Matematik, Türkçe, Fen Bilimleri, Sosyal Bilgiler, İngilizce, Tarih, Coğrafya)
3. WHEN I select "Lise" THEN the system SHALL display high school subjects (Matematik, Türkçe, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, İngilizce, Edebiyat, Felsefe)

### Requirement 3

**User Story:** As a student, I want to be able to change my education level selection, so that I can explore subjects from different grade levels if needed.

#### Acceptance Criteria

1. WHEN I have already selected an education level THEN the system SHALL allow me to click on a different education level box
2. WHEN I change my education level selection THEN the system SHALL immediately update the subject list to match the new selection
3. WHEN I change education level THEN the system SHALL clear any previous subject selection state

### Requirement 4

**User Story:** As a student, I want the education level selection to be visually clear and intuitive, so that I can easily understand and use the interface.

#### Acceptance Criteria

1. WHEN I view the education level selection THEN each level SHALL be displayed in a distinct, clickable box with clear labeling
2. WHEN I hover over an education level box THEN the system SHALL provide visual feedback (hover effect)
3. WHEN an education level is selected THEN the system SHALL visually indicate which level is currently active
4. WHEN education levels are displayed THEN they SHALL be arranged in a logical order (İlkokul, Ortaokul, Lise)