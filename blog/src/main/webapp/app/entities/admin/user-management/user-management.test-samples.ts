import dayjs from 'dayjs/esm';

import { IUserManagement, NewUserManagement } from './user-management.model';

export const sampleWithRequiredData: IUserManagement = {
  login: 'Diego.ManzanaresRomo',
  email: 'Margarita5@hotmail.com',
};

export const sampleWithPartialData: IUserManagement = {
  id: 18824,
  login: 'Guadalupe.LaboyMoreno4',
  firstName: 'Miguel',
  lastName: 'Navarrete Carrera',
  email: 'Graciela44@hotmail.com',
  activated: false,
  langKey: 'en',
  lastModifiedBy: 'upon around',
  lastModifiedDate: dayjs('2023-12-09T05:05'),
};

export const sampleWithFullData: IUserManagement = {
  id: 26558,
  login: 'Catalina72',
  firstName: 'Micaela',
  lastName: 'Apodaca Armendáriz',
  email: 'Alfredo_CardenasAdame65@hotmail.com',
  activated: false,
  langKey: 'en',
  imageUrl: 'the',
  createdBy: 'yahoo',
  createdDate: dayjs('2023-12-08T20:28'),
  lastModifiedBy: 'airline',
  lastModifiedDate: dayjs('2023-12-08T20:57'),
};

export const sampleWithNewData: NewUserManagement = {
  email: 'JuanCarlos82@yahoo.com',
  login: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
