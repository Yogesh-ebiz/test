import { toTitleCase } from "../utils/helper";

const { PDFDownloadLink, Page, Text, View, Document, StyleSheet } =  require('@react-pdf/renderer');
const ListItem = require('./components/ListItem');

// Register font
// Font.register({ family: 'Roboto', src: source });


// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f1f1f1',
    padding: '40 40 40 40',
  },
  section: {
    padding: 10,
  },
  bullet: {
    padding: '0 10',
  },
  h1: {
    fontSize: 16,
    margin: '0 0 6px 0',
  },
  subHeader2: {
    fontSize: 12
  },
  subHeader3: {
    fontSize: '11px',
    fontWeight: 600,
  },
  header: {
    // margin: '40 40 0 40',
    paddingBottom: 20,
    borderBottom: '1px solid #CCCCCC',
    name: {
      fontSize: 32,
      'text-transform': 'capitalize',
      // fontFamily: 'Roboto',
      fontWeight: 'bolder',
      letterSpacing: 3,
      marginBottom: 2,
    },
    headline: {
      fontSize: 12,
      color: '#BBBBBB'
    }
  },
  body: {
    display: 'flex',
    margin: '0',
    flexDirection: 'row',
    sectionHeader: {
      marginBottom: "18px",
      letterSpacing: 2,
      line: {
        height: "2px",
        width: "25px",
        backgroundColor: "#000000"
      }
    },
    sidebar: {
      width: "30%",
      borderRight: '1px solid #CCCCCC',
      padding: '20 20 0 0',
      label: {
        marginBottom: '4px',
        fontWeight: 900
      },
      value: {
        color: '#626262',
        fontSize: '11px',
      },
      section: {
        marginBottom: '20px',
      },
      detail: {
        marginBottom: 0,
        address: {
          street: {
            color: '#626262',
            fontSize: '11px',
            lineHeight: 1.2,
          },
          country: {
            color: '#626262',
            fontSize: '11px',
            lineHeight: 1.2,
          }
        }
      },
      skills: {
        marginBottom: '20px',
        rating: {
          height: '3px',
          width: '100%',
          margin: '6 0 10 0',
          backgroundColor: '#000000'
        }
      }
    },
    main: {
      width: '70%',
      padding: '20 0 20 20',
      profile: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottom: '1px solid #CCCCCC',
        summary: {
          fontSize: '11px',
          color: '#000000',
          lineHeight: '1.3',
        }
      },
      employment: {
        borderBottom: '1px solid #CCCCCC',
        marginBottom: 20,
        job: {

          paddingBottom: 10,
          role: {
            flexGrowth: 1,
            flexDirection: 'row',
          },
          title: {
            flex: 1,
            fontSize: '12px',
            fontWeight: 'bold',
            paddingRight: '10px'
          },
          description: {
            fontSize: '11px',
            marginBottom: '6px'
          },
          date: {
            fontSize: '11px',
            color: '#000000',
          },
          location: {
            fontSize: '11px',
            color: '#000000',
            marginBottom: 4,
          },
          tasks: {
            flexDirection: 'column',
            task: {
              flexDirection: 'col',
              marginBottom: '2px',
              fontSize: '11px',
              lineHeight: '1.2',
              color: '#000000',
            }
          }

        }

      }

    }

  }
});

// Create Document Component
const Berlin = (props) => (
  <Document>
    <Page wrap size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.header.name}>{props?.resume?.firstName.toUpperCase()}</Text>
        <Text style={styles.header.name}>{props?.resume?.lastName.toUpperCase()}</Text>
        <Text style={styles.header.headline}>{props?.resume?.jobTitle}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.body.sidebar}>
          <View style={styles.body.sidebar.detail}>
            <View style={styles.body.sectionHeader}>
              <Text style={styles.h1}>DETAILS</Text>
              <View style={styles.body.sectionHeader.line}></View>
            </View>
            {props.resume.primaryAddress &&
              <View style={styles.body.sidebar.section}>
                <View style={styles.body.sidebar.label}>
                  <Text style={styles.subHeader3}>ADDRESS</Text>
                </View>
                {props.resume.primaryAddress.address && <Text style={styles.body.sidebar.value}>{props.resume.primaryAddress.address}</Text> }
                {(props.resume.primaryAddress.city || props.resume.primaryAddress.state) && <Text style={styles.body.sidebar.value}>{props.resume.primaryAddress.city?props.resume.primaryAddress.city:''}{props.resume.primaryAddress.state? ', ' + props.resume.primaryAddress.state:''}</Text>}
                {props.resume.primaryAddress.country && <Text style={styles.body.sidebar.value}>{props.resume.primaryAddress.country}</Text>}
              </View>
            }
            {props.resume.primaryPhone &&
              <View style={styles.body.sidebar.section}>
                <View style={styles.body.sidebar.label}>
                  <Text style={styles.subHeader3}>PHONE</Text>
                </View>
                <Text style={styles.body.sidebar.value}>{props.resume.primaryPhone.value}</Text>
              </View>
            }
            {props.resume.primaryEmail &&
              <View style={styles.body.sidebar.section}>
                <View style={styles.body.sidebar.label}>
                  <Text style={styles.subHeader3}>EMAIL</Text>
                </View>
                <Text style={styles.body.sidebar.value}>{props.resume.primaryEmail.value}</Text>
              </View>
            }
            <View style={styles.body.sidebar.section}>
              <View style={styles.body.sidebar.label}>
                <Text style={styles.subHeader3}>NATIONALITY</Text>
              </View>
              <Text style={styles.body.sidebar.value}>American</Text>
            </View>
          </View>
          {props.resume.skills.length &&
            <View style={styles.body.sidebar.skills}>
              <View style={styles.body.sectionHeader}>
                <Text style={styles.h1}>SKILLS</Text>
                <View style={styles.body.sectionHeader.line}></View>
              </View>
              <View style={styles.body.sidebar.skills}>
                {props.resume.skills.map((skill) => (
                  <View>
                    <Text style={styles.body.sidebar.value}>{skill.name}</Text>
                    <View style={styles.body.sidebar.skills.rating}></View>
                  </View>
                ))}

              </View>
            </View>
          }
          {props.resume.languages.length &&
            <View>
              <View style={styles.body.sectionHeader}>
                <Text style={styles.h1}>LANGUAGES</Text>
                <View style={styles.body.sectionHeader.line}></View>
              </View>
              <View style={styles.body.sidebar.skills}>
                {props.resume.languages.map((language) => (
                  <View>
                    <Text style={styles.body.sidebar.value}>{language.name}</Text>
                    <View style={styles.body.sidebar.skills.rating}></View>
                  </View>
                ))}
              </View>
            </View>
          }
        </View>
        <View style={styles.body.main}>
          <View style={styles.body.main.profile}>
            <View style={styles.body.sectionHeader}>
              <Text style={styles.h1}>PROFILE</Text>
              <View style={styles.body.sectionHeader.line}></View>
            </View>
            <Text style={styles.body.main.profile.summary}>Innovative Programmer and Internet Entrepreneur striving to make the
              world a more unified and connected place. A creative thinker, adept ir
              software development and working with various data structures
            </Text>
          </View>
          <View style={styles.body.main.employment}>
            <View style={styles.body.sectionHeader}>
              <Text style={styles.h1}>EMPLOYMENT HISTORY</Text>
              <View style={styles.body.sectionHeader.line}></View>
            </View>
            {props.resume.experiences.map((job) => (
              <View style={styles.body.main.employment.job}>
                <View style={styles.body.main.employment.job.role}>
                  <Text style={styles.body.main.employment.job.title}>{toTitleCase(job.employmentTitle)}</Text>
                  <Text style={styles.body.main.employment.job.date}>{format(new Date(job.fromDate), 'MMM yy')} - {job.thruDate?format(new Date(job.thruDate), 'MMM yy'):'Present'}</Text>
                </View>
                <View>
                  <Text style={styles.body.main.employment.job.location}>{toTitleCase(job.employer.name)}, {job.city? job.city : job.state? job.state + ',': job.country}</Text>
                </View>
                <View style={styles.body.main.employment.job.tasks}>
                  {job.description && <Text style={styles.body.main.employment.job.description}>{job.description}</Text>}
                  {job.tasks &&
                    <View style={styles.body.main.employment.job.tasks.task}>
                      {job.tasks.map((task) => (
                        <ListItem>{task}</ListItem>
                      ))}

                    </View>
                  }
                  {/* <View style={styles.body.main.employment.job.tasks.task}> */}
                  {/*   <Text style={{ marginHorizontal: 8 }}>•</Text> */}
                  {/*   <Text>Worked to enhance software systems to help educators, scientists */}
                  {/*     and policy experts already working on some of humanity's greatest */}
                  {/*     challenges. */}
                  {/*   </Text> */}
                  {/* </View> */}
                </View>
              </View>
            ))}
          </View>

          <View wrap={false} style={styles.body.main.employment}>
            <View style={styles.body.sectionHeader}>
              <Text style={styles.h1}>EDUCATION</Text>
              <View style={styles.body.sectionHeader.line}></View>
            </View>
            {props.resume.educations.map((edu) => (
              <View style={styles.body.main.employment.job}>
                <View style={styles.body.main.employment.job.role}>
                  <Text style={styles.body.main.employment.job.title}>{toTitleCase(edu.degree)}</Text>
                  <Text style={styles.body.main.employment.job.date}>{format(new Date(edu.fromDate), 'MMM yy')} - {edu.thruDate?format(new Date(edu.thruDate), 'MMM yy'):'Present'}</Text>
                </View>
                <View>
                  <Text style={styles.body.main.employment.job.location}>{toTitleCase(edu.institute.name)}, {edu.institute.city? edu.institute.city : edu.institute.state? edu.institute.state + ',': edu.institute.country}</Text>
                </View>
              </View>
            ))}
            {/*<View style={styles.body.main.employment.job}>*/}
            {/*  <View style={styles.body.main.employment.job.role}>*/}
            {/*    <Text style={styles.body.main.employment.job.title}>Master of Computer Science, Boston College</Text>*/}
            {/*    <Text style={styles.body.main.employment.job.date}>Feb 2014 - Sep 2015</Text>*/}
            {/*  </View>*/}
            {/*  <View>*/}
            {/*    <Text style={styles.body.main.employment.job.location}>Menlo Park</Text>*/}
            {/*  </View>*/}

            {/*</View>*/}

          </View>
        </View>
      </View>
    </Page>
  </Document>
);
export default Berlin;
