import unittest
from biam.models import User

class UserModelTestCase(unittest.TestCase):

    def test_password_setter(self):
        print("Case 1: Password setter...")
        u = User(password = 'cat')
        self.assertTrue(u.password_hash is not None)
    
    def test_no_password_getter(self):
        print("Case 2: No password getter...")
        u = User(password = 'cat')
        with self.assertRaises(AttributeError):
            u.password
    
    def test_password_verification(self):
        print("Case 3: Password verification...")
        u = User(password = 'cat')
        self.assertTrue(u.verify_password('cat'))
        self.assertFalse(u.verify_password('dog'))
    
    def test_password_salts_are_random(self):
        print("Case 4: Password salts are random...")
        u = User(password = 'cat')
        u2 = User(password='cat')
        self.assertTrue(u.password_hash != u2.password_hash)

# runs the unit tests in the module
if __name__ == '__main__':
  unittest.main()

# Execute tests: python -m unittest