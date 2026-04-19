#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

using namespace std;

class CCourse;

class CStudent {
  private:
    string name;
    unsigned id;
    vector<CCourse *> cs;

  public:
    CStudent(string nm, unsigned sid) : name(nm), id(sid) {}
    ~CStudent() {}

    unsigned getId() const { return id; }
    const string &getName() const { return name; }

    void takeCourse(CCourse *c);
    void quitCourse(CCourse *c);

    void addCourseDirect(CCourse *c) {
        if (find(cs.begin(), cs.end(), c) == cs.end()) {
            cs.push_back(c);
        }
    }

    void removeCourseDirect(CCourse *c) { cs.erase(remove(cs.begin(), cs.end(), c), cs.end()); }

    string printCourses() const;
    int getTotalCredits() const;
};

class CCourse {
  private:
    string name;
    unsigned id;
    int credit;
    vector<CStudent *> stu;

  public:
    CCourse(string nm, unsigned cid, int crdt) : name(nm), id(cid), credit(crdt) {}
    ~CCourse() {}

    int getCredit() const { return credit; }
    unsigned getId() const { return id; }
    const string &getName() const { return name; }

    void take(CStudent *s) {
        if (find(stu.begin(), stu.end(), s) == stu.end()) {
            stu.push_back(s);
            s->addCourseDirect(this);
        }
    }

    void quit(CStudent *s) {
        stu.erase(remove(stu.begin(), stu.end(), s), stu.end());
        s->removeCourseDirect(this);
    }

    string printStudents() const {
        ostringstream os;
        os << "Course " << name << " (" << id << ") students:";
        for (size_t i = 0; i < stu.size(); ++i) {
            os << "\n- " << stu[i]->getName() << " (" << stu[i]->getId() << ")";
        }
        return os.str();
    }
};

void CStudent::takeCourse(CCourse *c) {
    if (c != 0) {
        c->take(this);
    }
}

void CStudent::quitCourse(CCourse *c) {
    if (c != 0) {
        c->quit(this);
    }
}

string CStudent::printCourses() const {
    ostringstream os;
    os << "Student " << name << " (" << id << ") courses:";
    for (size_t i = 0; i < cs.size(); ++i) {
        os << "\n- " << cs[i]->getName() << " [" << cs[i]->getId() << "]"
           << ", credits=" << cs[i]->getCredit();
    }
    return os.str();
}

int CStudent::getTotalCredits() const {
    int sum = 0;
    for (size_t i = 0; i < cs.size(); ++i) {
        sum += cs[i]->getCredit();
    }
    return sum;
}

int main() {
    CCourse cpp("C++ Programming", 1001, 3);
    CCourse ds("Data Structure", 1002, 4);
    CCourse algo("Algorithm", 1003, 3);

    CStudent s1("Alice", 2024001);
    CStudent s2("Bob", 2024002);
    CStudent s3("Carol", 2024003);

    s1.takeCourse(&cpp);
    s1.takeCourse(&ds);
    s2.takeCourse(&cpp);
    s2.takeCourse(&algo);
    s3.takeCourse(&ds);

    cout << cpp.printStudents() << "\n\n";
    cout << s1.printCourses() << endl;
    cout << "Total credits of " << s1.getName() << ": " << s1.getTotalCredits() << endl;

    return 0;
}
