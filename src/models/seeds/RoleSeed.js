const roleSeed = [
    {
        name: 'admin',
        description: 'Administrator with full access.',
        permissions: [
            'course:create,read,update,delete',
            'lecture:create,read,update,delete',
            'user:create,read,update,delete',
            'role:create,read,update,delete',
            'self:read,update'
        ]
    },{
        name: 'instructor',
        description: 'Instructor who can create and manage courses and lectures',
        permissions: [
            'course:create,read,update',
            'lecture:create,read,update',
            'self:read,update,delete'
        ]
    },{
        name: 'student',
        description: 'Student who can view courses and lectures',
        permissions: [
            'course:read',
            'lecture:read',
            'test:take',
            'assignment:submit',
            'grades:view'
        ]
    }
];

export default roleSeed;