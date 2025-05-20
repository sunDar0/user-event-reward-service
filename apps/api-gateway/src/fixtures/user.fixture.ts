import { RegisterUserDto, USER_ROLES } from '@app/common';

export const LOGIN_USER_FIXTURE = {
  USER_1: {
    value: {
      email: 'test@test.com',
      password: 'test',
    },
  },
  ADMIN_1: {
    value: {
      email: 'admin@test.com',
      password: 'admin',
    },
  },
  OPERATOR_1: {
    value: {
      email: 'operator@test.com',
      password: 'operator',
    },
  },
  AUDITOR_1: {
    value: {
      email: 'auditor@test.com',
      password: 'auditor',
    },
  },
  OPERATOR_AND_AUDITOR_1: {
    value: {
      email: 'multi-role-user@test.com',
      password: 'multi-role-user',
    },
  },
};

export const USER_FIXTURE = {
  USER_1: {
    value: {
      email: 'test@test.com',
      password: 'test',
      name: 'test',
      roles: [USER_ROLES.USER],
    } satisfies RegisterUserDto,
  },
  ADMIN_1: {
    value: {
      email: 'admin@test.com',
      password: 'admin',
      name: 'admin',
      roles: [USER_ROLES.ADMIN],
    } satisfies RegisterUserDto,
  },
  OPERATOR_1: {
    value: {
      email: 'operator@test.com',
      password: 'operator',
      name: 'operator',
      roles: [USER_ROLES.OPERATOR],
    } satisfies RegisterUserDto,
  },
  AUDITOR_1: {
    value: {
      email: 'auditor@test.com',
      password: 'auditor',
      name: 'auditor',
      roles: [USER_ROLES.AUDITOR],
    } satisfies RegisterUserDto,
  },
  OPERATOR_AND_AUDITOR_1: {
    value: {
      email: 'multi-role-user@test.com',
      password: 'multi-role-user',
      name: 'multi-role-user',
      roles: [USER_ROLES.OPERATOR, USER_ROLES.AUDITOR],
    } satisfies RegisterUserDto,
  },
};
