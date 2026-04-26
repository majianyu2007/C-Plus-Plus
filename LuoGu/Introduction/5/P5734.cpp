#include <iostream>
#include <string>

using namespace std;

void p1(string &str, const string substr) { str += substr; }

void p2(string &str, const int a, const int b) {
    string temp;
    for (auto i = a; i < a + b; ++i) {
        temp += str[i];
    }
    str = temp;
}

void p3(string &str, const int a, const string substr) {
    string temp;
    for (auto i = 0; i < a; ++i) {
        temp += str[i];
    }
    temp += substr;
    for (auto i = a; i < str.length(); ++i) {
        temp += str[i];
    }
    str = temp;
}

void p4(string &str, const string substr) {
    int pos = str.find(substr);
    if (pos == string::npos) {
        cout << -1 << endl;
    } else {
        cout << pos << endl;
    }
}

int main(void) {
    int q{0};
    cin >> q;
    string str;
    cin >> str;
    for (auto i = 0; i < q; ++i) {
        int mode{0};
        cin >> mode;
        switch (mode) {
        case 1: {
            string substr;
            cin >> substr;
            p1(str, substr);
            cout << str << endl;
            break;
        }
        case 2: {
            int a{0}, b{0};
            cin >> a >> b;
            p2(str, a, b);
            cout << str << endl;
            break;
        }
        case 3: {
            int a{0};
            string substr;
            cin >> a >> substr;
            p3(str, a, substr);
            cout << str << endl;
            break;
        }
        case 4: {
            string substr;
            cin >> substr;
            p4(str, substr);
            break;
        }
        default:
            return 1;
        }
    }

    return 0;
}
