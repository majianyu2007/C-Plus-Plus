#include <iostream>
#include <stack>
#include <string>
using namespace std;

template <class T> class Q {
  private:
    stack<T> s1;
    stack<T> s2;

  public:
    void MoveIfNeeded();
    void Enqueue(const T &x);
    T Dequeue();
    bool QueueEmpty() const;
};

template <class T> void Q<T>::MoveIfNeeded() {
    if (s2.empty()) {
        while (!s1.empty()) {
            s2.push(s1.top());
            s1.pop();
        }
    }
}

template <class T> void Q<T>::Enqueue(const T &x) { s1.push(x); }

template <class T> T Q<T>::Dequeue() {
    MoveIfNeeded();
    T value = s2.top();
    s2.pop();
    return value;
}

template <class T> bool Q<T>::QueueEmpty() const { return s1.empty() && s2.empty(); }

int main() {
    Q<char> q1;
    cout << boolalpha << "Is q1 empty? " << q1.QueueEmpty() << endl;
    q1.Enqueue('a');
    q1.Enqueue('b');
    q1.Enqueue('c');
    cout << boolalpha << "Is q1 empty? " << q1.QueueEmpty() << endl;
    for (int i = 0; i < 3; i++)
        cout << q1.Dequeue() << " ";
    cout << endl;

    Q<int> q2;
    q2.Enqueue(1);
    q2.Enqueue(2);
    q2.Enqueue(3);
    for (int i = 0; i < 3; i++)
        cout << q2.Dequeue() << " ";
    cout << endl;

    Q<string> q3;
    q3.Enqueue("Saber");
    q3.Enqueue("Rider");
    q3.Enqueue("Caster");
    for (int i = 0; i < 3; i++)
        cout << q3.Dequeue() << " ";
    return 0;
}
