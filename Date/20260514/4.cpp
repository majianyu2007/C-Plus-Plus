#include <iostream>
using namespace std;

template <class T> class LinkedList;

template <class T> ostream &operator<<(ostream &out, const LinkedList<T> &list);

template <class T> LinkedList<T> operator+(const LinkedList<T> &A, const LinkedList<T> &B);

template <class T> struct Node {
    T data;
    Node<T> *link;

    Node();
    Node(const T &x);
};

template <class T> class LinkedList {
  private:
    Node<T> *first;

  public:
    LinkedList();
    LinkedList(const LinkedList<T> &other);
    ~LinkedList();

    LinkedList<T> &operator=(const LinkedList<T> &other);

    void TailInsert(const T &x);
    void Clear();

    friend ostream &operator<< <T>(ostream &out, const LinkedList<T> &list);
    friend LinkedList<T> operator+ <T>(const LinkedList<T> &A, const LinkedList<T> &B);
};

template <class T> Node<T>::Node() { link = NULL; }

template <class T> Node<T>::Node(const T &x) {
    data = x;
    link = NULL;
}

template <class T> LinkedList<T>::LinkedList() {
    first = new Node<T>;
    first->link = NULL;
}

template <class T> LinkedList<T>::LinkedList(const LinkedList<T> &other) {
    first = new Node<T>;
    first->link = NULL;

    Node<T> *p = other.first->link;

    while (p != NULL) {
        TailInsert(p->data);
        p = p->link;
    }
}

template <class T> LinkedList<T>::~LinkedList() {
    Clear();
    delete first;
}

template <class T> LinkedList<T> &LinkedList<T>::operator=(const LinkedList<T> &other) {
    if (this != &other) {
        Clear();

        Node<T> *p = other.first->link;

        while (p != NULL) {
            TailInsert(p->data);
            p = p->link;
        }
    }

    return *this;
}

template <class T> void LinkedList<T>::Clear() {
    Node<T> *p = first->link;

    while (p != NULL) {
        Node<T> *q = p;
        p = p->link;
        delete q;
    }

    first->link = NULL;
}

template <class T> void LinkedList<T>::TailInsert(const T &x) {
    Node<T> *newNode = new Node<T>(x);

    Node<T> *p = first;

    while (p->link != NULL) {
        p = p->link;
    }

    p->link = newNode;
}

template <class T> ostream &operator<<(ostream &out, const LinkedList<T> &list) {
    Node<T> *p = list.first->link;

    while (p != NULL) {
        out << p->data << "  ";
        p = p->link;
    }

    out << endl;

    return out;
}

template <class T> LinkedList<T> operator+(const LinkedList<T> &A, const LinkedList<T> &B) {
    LinkedList<T> result;

    Node<T> *p = A.first->link;

    while (p != NULL) {
        result.TailInsert(p->data);
        p = p->link;
    }

    p = B.first->link;

    while (p != NULL) {
        result.TailInsert(p->data);
        p = p->link;
    }

    return result;
}

int main() {
    LinkedList<double> List1;

    for (int i = 0; i < 4; i++)
        List1.TailInsert(i + 0.1);

    cout << "List1: " << List1;

    LinkedList<double> List2;

    for (int i = 0; i < 3; i++)
        List2.TailInsert(i + 0.5);

    cout << "List2: " << List2;

    cout << "List1 + List2: " << List1 + List2;

    cout << "List1 + List2: " << operator+(List2, List1);

    return 0;
}
