#include <iostream>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::string;

class CStack
{
private:
    char *s;
    int tp;
    int size;
    
public:
    CStack(int initSize = 5) : tp(-1), size(initSize)
    {
        s = new char[size];
    }
    ~CStack()
    {
        delete[] s;
    }
    bool isEmpty()
    {
        return tp == -1;
    }
    bool isFull()
    {
        return tp == size - 1;
    }
    void push(char c)
    {
        if (isFull())
        {
            char *newS = new char[size * 2];
            for (int i = 0; i < size; i++)
                newS[i] = s[i];
            delete[] s;
            s = newS;
            size *= 2;
        }
        s[++tp] = c;
    }
    char pop()
    {
        return s[tp--];
    }
    char top()
    {
        return s[tp];
    }
};

int main(void)
{
    string str;
    getline(cin, str);
    CStack stk;
    bool balanced = true;
    for (int i = 0; i < (int)str.size() && balanced; i++)
    {
        char c = str[i];
        if (c == '(' || c == '[' || c == '{')
            stk.push(c);
        else if (c == ')' || c == ']' || c == '}')
        {
            if (stk.isEmpty())
                balanced = false;
            else
            {
                char t = stk.pop();
                if ((c == ')' && t != '(') ||
                    (c == ']' && t != '[') ||
                    (c == '}' && t != '{'))
                    balanced = false;
            }
        }
    }
    if (!stk.isEmpty())
        balanced = false;
    cout << (balanced ? "Balanced" : "Not balanced") << endl;
    return 0;
}
